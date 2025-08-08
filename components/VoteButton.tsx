"use client"

import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { Heart, Users } from "lucide-react"
import { CountdownProvider, useCountdown } from "../contexts/CountdownContext"

type VoteButtonProps = {
  artId: string
  userId: string
}


export default function VoteButton({ artId, userId }: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchVoteInfo = async () => {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", userId)
        .eq("art_id", artId)
        .single()

      setHasVoted(!!existingVote)

      // Get total votes
      const { count } = await supabase.from("votes").select("*", { count: "exact", head: true }).eq("art_id", artId)

      setVoteCount(count || 0)
    }

    fetchVoteInfo()
  }, [artId, userId])

const handleVote = async () => {
  if (loading || hasEnded) return; // prevent spam clicks
  setLoading(true);

  if (hasVoted) {
    // Remove vote
    const { error: deleteError } = await supabase
      .from("votes")
      .delete()
      .eq("art_id", artId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Vote delete failed:", deleteError);
      alert(`حدث خطأ أثناء إلغاء التصويت:\n${deleteError.message}`);
    } else {
      setHasVoted(false);
      // refresh count
      const { count } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("art_id", artId);
      setVoteCount(count || 0);
    }
  } else {
    // Add vote
    const { error: insertError } = await supabase
      .from("votes")
      .insert([{ art_id: artId, user_id: userId }]);

    if (insertError) {
      console.error("Vote insert failed:", insertError);
      if (insertError.code === "23505") {
        alert("لقد قمت بالتصويت بالفعل لهذا العمل الفني.");
      } else {
        alert(`حدث خطأ أثناء التصويت:\n${insertError.message}`);
      }
    } else {
      setHasVoted(true);
      // refresh count
      const { count } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("art_id", artId);
      setVoteCount(count || 0);
    }
  }

  setLoading(false);
};
const { hasEnded } = useCountdown()
  return (
    <CountdownProvider>
    <div className="space-y-2">
      <button
        onClick={handleVote}
        disabled={loading || hasEnded}
        className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          hasVoted
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
            : "bg-white/80 backdrop-blur-sm border-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 hover:shadow-md"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            يتم التصويت...
          </>
        ) : (
          <>
            <Heart className={`w-4 h-4 ${hasVoted ? "fill-current" : ""}`} />
            {hasVoted ? "تم التصويت!" : "التصويت"}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-1 text-amber-700">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{voteCount} عدد التصويت</span>
      </div>
    </div>
    </CountdownProvider>
  )
}
