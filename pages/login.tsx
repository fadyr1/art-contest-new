"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"
import { LogIn, Mail, Lock, Palette, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)
     router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
              مرحبا بك!
            </h1>
            <p className="text-amber-600 mt-2">سجل الدخول الي حسابك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                البريد الالكتروني
              </label>
              <input
                type="email"
                placeholder="البريد الالكتروني..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 transition-all"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                كلمة المرور
              </label>
              <input
                type="password"
                placeholder="كلمة المرور..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-amber-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-200 focus:outline-none text-amber-900 placeholder-amber-500 transition-all"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-lg shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  يتم تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-amber-200">
              <p className="text-amber-600">
                {"ليس لديك حساب؟ "}
                <Link href="/signup" className="text-amber-800 font-medium hover:text-amber-900 transition-colors">
                  انشئ حسابك هنا
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
