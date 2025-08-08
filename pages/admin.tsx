'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

type Artwork = {
  id: string
  title: string
  image_url: string
  is_approved:boolean
}

type Vote = {
  id: string
  art_id: string
}

type Comment = {
  id: string
  art_id: string
  content: string
  inserted_at: string
}

export default function AdminDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [endTime, setEndTime] = useState("");


  useEffect(() => {
    const fetchData = async () => {
      const { data: arts } = await supabase.from('artworks').select('*')
      const { data: vts } = await supabase.from('votes').select('*')
      const { data: cmts } = await supabase.from('comments').select('*')

      setArtworks(arts || [])
      setVotes(vts || [])

      const grouped: Record<string, Comment[]> = {}
      cmts?.forEach((c) => {
        if (!grouped[c.art_id]) grouped[c.art_id] = []
        grouped[c.art_id].push(c)
      })
      setComments(grouped)
    }

    fetchData()
  }, [])

  const countVotes = (artId: string) => votes.filter((v) => v.art_id === artId).length

  const handleDeleteArtwork = async (artId: string) => {
    if (!confirm('Are you sure you want to delete this artwork and all related data?')) return

    await supabase.from('votes').delete().eq('art_id', artId)
    await supabase.from('comments').delete().eq('art_id', artId)
    const { error } = await supabase.from('artworks').delete().eq('id', artId)
    if (error) {
      alert('Failed to delete artwork: ' + error.message)
      return
    }

    setArtworks((prev) => prev.filter((a) => a.id !== artId))
    setVotes((prev) => prev.filter((v) => v.art_id !== artId))
    const newComments = { ...comments }
    delete newComments[artId]
    setComments(newComments)
  }

  const handleDeleteComment = async (commentId: string, artId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) {
      alert('Failed to delete comment: ' + error.message)
      return
    }

    setComments((prev) => ({
      ...prev,
      [artId]: prev[artId]?.filter((c) => c.id !== commentId) || [],
    }))
  }


  const approveArtwork = async (id: string) => {
    const { error } = await supabase
      .from('artworks')
      .update({ is_approved: true }) // or status: 'approved'
      .eq('id', id)

    if (error) {
      alert('Error approving artwork: ' + error.message)
    } else {
      // Optionally re-fetch or update local state
      setArtworks((prev) =>
        prev.map((art) => (art.id === id ? { ...art, is_approved: true } : art))
      )
    }
  }

     useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/') // Redirect to homepage
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        router.push('/') // Redirect if not admin
        return
      }

      setIsAdmin(true)
      setLoading(false)
    }

    checkAdmin()
  }, [router])

    useEffect(() => {
    const fetchTime = async () => {
      const { data, error } = await supabase
        .from("contest_settings")
        .select("end_time")
        .single();

      if (error) console.error(error);
      if (data?.end_time) {
        // Convert timestamp to datetime-local format
        const localTime = new Date(data.end_time)
          .toISOString()
          .slice(0, 16);
        setEndTime(localTime);
      }
    };

    fetchTime();
  }, []);

    const handleSave = async () => {
    const { error } = await supabase
      .from("contest_settings")
      .update({ end_time: new Date(endTime).toISOString() })
      .eq("id", 1); // Assuming only one row

    if (error) {
      console.error(error);
    } else {
      alert("Contest time updated!");
    }
  };


  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (!isAdmin) return null
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen  ">
        <h1 className="text-3xl font-bold mb-6 text-center">🛠️ Admin Dashboard</h1>
            <div className="p-4">
      <label className="block text-sm font-medium text-gray-700">
        Set Contest End Time:
      </label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="border p-2 rounded mt-1"
      />
      <button
        onClick={handleSave}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Save Time
      </button>
    </div>
        {artworks.length === 0 ? (
          <p className="text-center text-gray-500">No artworks submitted.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

            {artworks.map((art) => (
              <div key={art.id} className="p-4 border rounded-2xl shadow-lg bg-white hover:shadow-xl transition">
  <h2 className="text-lg font-semibold mb-2">{art.title}</h2>
  <img
    src={art.image_url}
    alt={art.title}
    className="w-full h-48 object-cover rounded mb-2"
  />
  <p className="text-sm text-gray-600 mb-2">Votes: {countVotes(art.id)}</p>

  <button
    className="text-sm text-red-600 underline mb-4"
    onClick={() => handleDeleteArtwork(art.id)}
  >
    Delete Artwork
  </button>

         {art.is_approved ? (
                <p className="text-green-600 font-medium mt-2">✅ Approved</p>
              ) : (
                <button
                  onClick={() => approveArtwork(art.id)}
                  className="text-sm ml-12 text-blue-600 underline mb-4"
                >
                  Approve
                </button>
              )}

  <h3 className="text-sm font-semibold mb-1">Comments:</h3>
  <ul className="text-sm text-gray-700 max-h-32 overflow-auto pr-1">
    {comments[art.id]?.length ? (
      comments[art.id].map((c) => (
        <li key={c.id} className="mb-1 flex justify-between items-start">
          <span>
            {c.content}
            <span className="text-xs text-gray-400 ml-2 block">
              {new Date(c.inserted_at).toLocaleString()}
            </span>
          </span>
          <button
            className="text-xs text-red-500 ml-2"
            onClick={() => handleDeleteComment(c.id, art.id)}
          >
            Delete
          </button>
        </li>
      ))
    ) : (
      <li className="text-gray-400 italic">No comments</li>
    )}
  </ul>
</div>

            ))}
          </div>
        )}
      </div>
    </div>
  )
}
