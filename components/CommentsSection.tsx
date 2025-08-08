"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { MessageCircle, User, Clock } from "lucide-react"

type Props = {
  artId: string
}
type Comment = {
  profiles: any
  id: string
  content: string
  created_at: string
}
export default function CommentsSection({ artId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState(false)
const fetchComments = async () => {
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username)")
    .eq("art_id", artId);
  if (error) {
    console.error("Error fetching comments:", error);
    return;
  }
  setComments(data);
};
  useEffect(() => {
    fetchComments()
  }, [artId])

  return (
    <div className="bg-amber-50/30 backdrop-blur-sm rounded-2xl border border-amber-200">
      <button
        onClick={() => setShowComments(!showComments)}
        className="w-full p-4 flex items-center justify-between text-amber-800 hover:bg-amber-100/50 rounded-2xl transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">التعليقات ({comments.length})</span>
        </div>
        <div className={`transform transition-transform ${showComments ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showComments && (
        <div className="px-4 pb-4">
          {comments.length === 0 ? (
            <div className="text-center py-6">
              <MessageCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-amber-600 text-sm">لا تعليقات حتي الأن</p>
              <p className="text-amber-500 text-xs mt-1">كن اول تعليق!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs text-amber-600 font-medium">{comment.profiles?.username || "مستخدم غير معروف"}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-900 leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
