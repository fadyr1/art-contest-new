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
  const [search, setSearch] = useState("");
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: number }>({});
  const [winner, setWinner] = useState<Artwork | null>(null);
  const [winningArtId, setWinningArtId] = useState<string | null>(null);
  const [countdownOver, setCountdownOver] = useState(false);
  const router = useRouter()
 
     const filteredArtworks = artworks.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.content.toLowerCase().includes(search.toLowerCase()) ||
    a.profiles?.username.toLowerCase().includes(search.toLowerCase())

  );


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-gradient relative overflow-hidden" dir="rtl">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-200/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200/20 rounded-full animate-float animate-delay-200"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full animate-float animate-delay-400"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-amber-300/20 rounded-full animate-float animate-delay-600"></div>
      </div>

      <header className="bg-white/95 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm animate-slide-in-up">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-3 rounded-2xl shadow-lg animate-pulse-glow hover-lift">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-nunito font-bold bg-gradient-to-r from-amber-600 to-amber-600 bg-clip-text text-transparent animate-shimmer">
                  مهرجان الكرازة 2025
                </h1>
              </div>
              <input
        type="text"
        placeholder="ابحث عن عمل فني..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-80 p-2 border rounded-xl mb-6 mt-4 border-amber-500 mr-40"
      />
            </div>
                 {userId ? (
                         <LogoutButton />
                        ) : (

                            <button onClick={() => router.push("/login")} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-bounce font-medium shadow-lg hover-glow">
                              تسجيل الدخول
                            </button>
                           
                        )}
            
          </div>
                
        </div>
      </header>

      <section className="relative py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-amber-100 animate-scale-in hover-lift">
            <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-6 animate-float" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4 animate-slide-in-up animate-delay-200">اثْبُتْ عَلَى مَا تَعَلَّمْتَ</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-slide-in-up animate-delay-300">
            سجل اعمالك الفنية في مسابقة مهرجان الكرازة 2025 وشارك موهبتك! </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {artworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-16 max-w-lg mx-auto border border-blue-100 shadow-lg animate-scale-in hover-lift">
              <Palette className="w-20 h-20 text-amber-600 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4 animate-slide-in-up animate-delay-200">لا توجد أعمال فنية بعد</h3>
              <p className="text-slate-600 text-lg animate-slide-in-up animate-delay-300">كن أول من يشارك تحفته الفنية مع العالم!</p>
            </div>
          </div>
        ) : (
          <>
          
          <CountdownProvider>
            <section className="mb-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-100 shadow-lg animate-scale-in hover-lift">
                <div><CountdownTimer
                   
                  onEnd={() => {
                    setCountdownOver(true)
                    calculateWinner()
                  }}
                />
                  {countdownOver && winningArtId && (
                <div className="text-center mb-6 mt-2 text-xl font-bold text-green-700 animate-pulse-glow">
                  الفائز: {
                    artworks.find((art) => art.id === winningArtId)?.profiles?.username || "غير معروف"
                  }
                </div>
               )} 
               </div>
              
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div className="space-y-2 animate-slide-in-up animate-delay-100">
                    <div className="text-4xl font-bold text-amber-600 transition-smooth hover:scale-110">{artworks.length}</div>
                    <div className="text-slate-600 font-medium tracking-wide">عمل فني</div>
                  </div>
                  <div className="space-y-2 animate-slide-in-up animate-delay-200">
                    <div className="text-4xl font-bold text-amber-600 transition-smooth hover:scale-110">
                      {Object.values(voteCounts).reduce((sum, count) => sum + count, 0)}
                    </div>
                    <div className="text-slate-600 font-medium tracking-wide">إجمالي الأصوات</div>
                  </div>
                  <div className="space-y-2 animate-slide-in-up animate-delay-300">
                    <div className="text-4xl font-bold text-amber-600 transition-smooth hover:scale-110">
                      {new Set(artworks.map((art) => art.id)).size}
                    </div>
                    <div className="text-slate-600 font-medium tracking-wide">فنان</div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div  className="text-center">
              <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center animate-slide-in-up">الأعمال الفنية المميزة</h2>
               {userId ? (
                      <button onClick={() => router.push("/AddArtworkForm")} className="bg-gradient-to-r mb-6 from-amber-600 to-amber-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-bounce font-medium shadow-lg hover-glow animate-scale-in animate-delay-200">
                               اضف عملك الفني  
                            </button>    
                        ) : (

                            <div></div>
                        )}
              
                            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArtworks.map((art, index) => {
                  const isWinner = countdownOver && winningArtId === art.id
                  const animationDelay = `animate-delay-${Math.min((index % 6 + 1) * 100, 600)}`

                  return (
                    <article
                      key={art.id}
                      className={`relative bg-white/90 backdrop-blur-md border rounded-3xl overflow-hidden shadow-lg transition-smooth group hover-lift animate-scale-in ${animationDelay} ${
                        isWinner ? "border-amber-700 shadow-lg ring-4 ring-amber-700 animate-pulse-glow" : "border-blue-100 hover:shadow-2xl hover-glow"
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute top-0 left-0 bg-amber-700 text-white font-bold px-3 py-1 rounded-br-xl z-10 animate-float">
                          🏆 الفائز
                        </div>
                      )}
                     <a href={art.image_url} target="_blank" rel="noopener noreferrer"> <div className="relative overflow-hidden">
                      
 <img
                          src={art.image_url || "/placeholder.svg"}
                          alt={art.title}
                          className="w-full h-72 object-cover transition-smooth group-hover:scale-110 group-hover:rotate-1"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                        <div className="absolute top-4 left-4 transform transition-bounce group-hover:scale-110">
                          <Badge className="bg-white/95 text-black border-black shadow-md font-medium animate-shimmer">
                            #{art.id}
                          </Badge>
                        </div>
                      </div>
</a>
                      <div className="p-8">
                        <header className="mb-6">
                          <h3 className="text-2xl font-bold text-slate-800 mb-3 line-clamp-2 text-right transition-smooth group-hover:text-amber-600">
                            {art.title}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-600 justify-end transition-smooth group-hover:text-slate-800">
                            <span className="font-medium">الفنان: {art.profiles?.username || "غير معروف"}</span>
                            <User className="w-4 h-4 transition-bounce group-hover:scale-110" />
                          </div>
                        </header>
                        <p className="text-slate-600 leading-relaxed mb-6 text-right transition-smooth group-hover:text-slate-700">
                          {art.content}
                        </p>
                        <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-xl justify-end transition-smooth group-hover:bg-amber-50 hover-lift">
                          <span className="text-sm font-semibold text-orange-800 transition-smooth group-hover:text-amber-800">{voteCounts[art.id] || 0} صوت</span>
                          <Heart className="w-4 h-4 text-orange-600 transition-bounce group-hover:scale-110 group-hover:text-amber-600" />
                        </div>
                        {userId ? (
                          <div className="space-y-6">
                            <RatingStars artId={art.id} userId={userId} />
                            <div className="space-y-4">
                              <CommentsSection artId={art.id} />
                              <CommentForm artId={art.id} userId={userId} onCommentAdded={() => {}} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-slate-50 rounded-2xl transition-smooth group-hover:bg-amber-50 hover-lift">
                            <Users className="w-8 h-8 text-slate-400 mx-auto mb-3 transition-bounce group-hover:scale-110 group-hover:text-amber-500" />
                            <p className="text-slate-600 mb-4 font-medium transition-smooth group-hover:text-slate-700">انضم إلى المحادثة</p>
                            <button onClick={() => router.push("/login")} className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-bounce font-medium shadow-lg hover-glow">
                              تسجيل الدخول
                            </button>
                          </div>
                        )}
                      </div>
                      
                    </article>
                  )
                })}
</div>
                      {/* Artworks list */}
 
         
            </section>
            </CountdownProvider>
          </>
        )}
      </main>
    </div>
  )
}
