"use client"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { MessageCircle, Send } from "lucide-react"
import { useCountdown } from "../contexts/Countdowncontext"

interface CommentFormProps {
  artId: string;
  userId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ artId, userId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)

    const { error } = await supabase.from("comments").insert([{ art_id: artId, user_id: userId, content }])

    setLoading(false)
    if (error) {
      console.error("خطأ في إضافة التعليق:", error)
      alert("خطأ في اضافة التعليق")
    } else {
      setContent("")
      onCommentAdded()
    }
  }
const { hasEnded } = useCountdown()
  return (
    <div className="bg-amber-50/50 backdrop-blur-sm rounded-2xl p-4 border border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">تعليق</span>
      </div>

      <textarea disabled={hasEnded}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="الحالة..."
        className="w-full p-3 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 resize-none"
        rows={3}
      />

<button
  onClick={handleSubmit}
  disabled={loading || !content.trim() || hasEnded}
  className="mt-3 w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
>
  {loading ? (
    <>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      يتم الاضافة...
    </>
  ) : hasEnded ? (
    <p className="text-white-500 text-sm">تم إيقاف التعليقات بعد انتهاء التصويت.</p>
  ) : (
    <>
      <Send className="w-4 h-4" />
      اضافة تعليق
    </>
  )}
</button>

    </div>
  )
}
