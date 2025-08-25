"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import VoteButton from "../components/VoteButton"
import LogoutButton from "../components/LogoutButton"
import CommentForm from "../components/CommentForm"
import CommentsSection from "../components/CommentsSection"
import { Badge } from "@/components/ui/badge"
import { Palette, User, Trophy, Users, Heart } from 'lucide-react'
import CountdownTimer from "../components/CountdownTimer"
import { CountdownProvider } from "../contexts/CountdownContext"
import { useRouter } from "next/navigation"
import RatingStars from "../components/RatingStars"


interface Artwork {
  id: string;
  title:string;
  image_url: string;
  user_id: string;
  content:string;
  profiles?: {
    username: string;
  };
}
type Vote = {
  art_id: string
  rating: number
}


export default function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: number }>({});
  const [winner, setWinner] = useState<Artwork | null>(null);
  const [winningArtId, setWinningArtId] = useState<string | null>(null);
  const [countdownOver, setCountdownOver] = useState(false);
  const router = useRouter()
 


  const calculateWinner = async () => {
    const { data: votes, error } = await supabase.from("votes").select("art_id, rating")
    if (error || !votes) {
      console.error("Error fetching votes:", error)
      return
    }
    const voteMap: Record<string, number> = {}
  votes.forEach((vote: Vote) => {
    voteMap[vote.art_id] = (voteMap[vote.art_id] || 0) + (vote.rating || 0)
  })

    const sorted = Object.entries(voteMap).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0) {
      const [winnerArtId] = sorted[0]
      setWinningArtId(winnerArtId)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }

    const fetchArtworks = async () => {
      const { data, error } = await supabase.from("artworks").select("*, profiles!artworks_user_id_fkey(username)").eq('is_approved', true);
      
      if (error) console.error(error)
      else setArtworks(data)
    }

    const fetchVotes = async () => {
      const { data, error } = await supabase.from("votes").select("art_id")
      if (error) {
        console.error("Error fetching votes:", error)
        return
      }
      const counts: { [key: string]: number } = {}
      data.forEach((vote: any) => {
        counts[vote.art_id] = (counts[vote.art_id] || 0) + 1
      })
      setVoteCounts(counts)
    }

    fetchUser()
    fetchArtworks()
    fetchVotes()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <header className="bg-white/95 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-3 rounded-2xl shadow-lg">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-nunito font-bold bg-gradient-to-r from-amber-600 to-amber-600 bg-clip-text text-transparent">
                  مهرجان الكرازة 2025
                </h1>
              </div>
            </div>
                 {userId ? (
                         <LogoutButton />
                        ) : (

                            <button onClick={() => router.push("/login")} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg">
                              تسجيل الدخول
                            </button>
                           
                        )}
            
          </div>
        </div>
      </header>

      <section className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-amber-100">
            <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">اثْبُتْ عَلَى مَا تَعَلَّمْتَ</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            سجل اعمالك الفنية في مسابقة مهرجان الكرازة 2025 وشارك موهبتك! </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-16 max-w-lg mx-auto border border-blue-100 shadow-lg">
              <Palette className="w-20 h-20 text-amber-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">لا توجد أعمال فنية بعد</h3>
              <p className="text-slate-600 text-lg">كن أول من يشارك تحفته الفنية مع العالم!</p>
            </div>
          </div>
        ) : (
          <>
          
          <CountdownProvider>
            <section className="mb-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-100 shadow-lg">
                <div><CountdownTimer
                   
                  onEnd={() => {
                    setCountdownOver(true)
                    calculateWinner()
                  }}
                />
                  {countdownOver && winningArtId && (
                <div className="text-center mb-6 mt-2 text-xl font-bold text-green-700">
                  الفائز: {
                    artworks.find((art) => art.id === winningArtId)?.profiles?.username || "غير معروف"
                  }
                </div>
               )} 
               </div>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-amber-600">{artworks.length}</div>
                    <div className="text-slate-600 font-medium tracking-wide">عمل فني</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-amber-600">
                      {Object.values(voteCounts).reduce((sum, count) => sum + count, 0)}
                    </div>
                    <div className="text-slate-600 font-medium tracking-wide">إجمالي الأصوات</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-amber-600">
                      {new Set(artworks.map((art) => art.id)).size}
                    </div>
                    <div className="text-slate-600 font-medium tracking-wide">فنان</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div  className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center">الأعمال الفنية المميزة</h2>
               {userId ? (
                      <button onClick={() => router.push("/AddArtworkForm")} className="bg-gradient-to-r mb-6 from-amber-600 to-amber-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg">
                               اضف عملك الفني  
                            </button>    
                        ) : (

                            <div></div>
                        )}
              
                            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks.map((art) => {
                  const isWinner = countdownOver && winningArtId === art.id

                  return (
                    <article
                      key={art.id}
                      className={`relative bg-white/90 backdrop-blur-md border rounded-3xl overflow-hidden shadow-lg transition-all duration-500 group ${
                        isWinner ? "border-amber-700 shadow-lg ring-4 ring-amber-700" : "border-blue-100 hover:shadow-2xl hover:-translate-y-2"
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute top-0 left-0 bg-amber-700 text-white font-bold px-3 py-1 rounded-br-xl z-10">
                          🏆 الفائز
                        </div>
                      )}
                     <a href={art.image_url} target="_blank" rel="noopener noreferrer"> <div className="relative overflow-hidden">
                      
 <img
                          src={art.image_url || "/placeholder.svg"}
                          alt={art.title}
                          className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/95 text-black border-black shadow-md font-medium">
                            #{art.id}
                          </Badge>
                        </div>
                      </div>
</a>
                      <div className="p-8">
                        <header className="mb-6">
                          <h3 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-2 text-right">
                            {art.title}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-600 justify-end">
                            <span className="font-medium">الفنان: {art.profiles?.username || "غير معروف"}</span>
                            <User className="w-4 h-4" />
                          </div>
                        </header>
                        <p className="text-slate-600 leading-relaxed mb-6 text-right">
                          {art.content}
                        </p>
                        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl justify-end">
                          <span className="text-sm font-semibold text-orange-800">{voteCounts[art.id] || 0} صوت</span>
                          <Heart className="w-4 h-4 text-orange-600" />
                        </div>
                        {userId ? (
                          <div className="space-y-6">
                            {/* <VoteButton artId={art.id} userId={userId} /> */}
                            <RatingStars artId={art.id} userId={userId} />
                            <div className="space-y-4">
                              <CommentsSection artId={art.id} />
                              <CommentForm artId={art.id} userId={userId} onCommentAdded={() => {}} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-slate-50 rounded-2xl">
                            <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600 mb-4 font-medium">انضم إلى المحادثة</p>
                            <button onClick={() => router.push("/login")} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg">
                              تسجيل الدخول
                            </button>
                          </div>
                        )}
                      </div>
                      
                    </article>
                  )
                })}
              </div>
         
            </section>
            </CountdownProvider>
          </>
        )}
      </main>
    </div>
  )
}
