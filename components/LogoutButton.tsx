"use client"

import { supabase } from "../lib/supabase"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <button
      onClick={handleLogout}
      className="bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-800 px-4 py-2 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
    >
      <LogOut className="w-4 h-4" />
      تسجيل الخروج
    </button>
  )
}
