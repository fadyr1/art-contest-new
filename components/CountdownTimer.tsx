"use client"

import { useEffect, useState } from "react"
import { useCountdown } from "../contexts/CountdownContext"
import { supabase } from "../lib/supabase"

export default function CountdownTimer({ onEnd }: { onEnd: () => void }) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [endTime, setEndTime] = useState<string | null>(null)
  const { setHasEnded } = useCountdown()
 
  // Fetch the end time from the database
  useEffect(() => {
    const fetchEndTime = async () => {
      const { data, error } = await supabase
        .from("contest_settings")
        .select("end_time")
        .single()

      if (error) {
        console.error("Error fetching contest end time:", error)
        return
      }
      setEndTime(data?.end_time)
    }

    fetchEndTime()

    // Optional: Subscribe to changes in the end time (live updates if admin changes it)
    const channel = supabase
      .channel("contest-settings-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contest_settings" },
        (payload) => {
          setEndTime(payload.new.end_time)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Countdown logic
  useEffect(() => {
    if (!endTime) return

    const targetTime = new Date(endTime).getTime()
    const now = new Date().getTime()
    const diff = targetTime - now

    if (diff <= 0) {
      setTimeLeft(0)
      setHasEnded(true)
      onEnd()
      return
    }

    setTimeLeft(diff)

    const interval = setInterval(() => {
      const newDiff = targetTime - new Date().getTime()
      if (newDiff <= 0) {
        clearInterval(interval)
        setTimeLeft(0)
        setHasEnded(true)
        onEnd()
      } else {
        setTimeLeft(newDiff)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, onEnd, setHasEnded])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  if (!endTime) return <div>جاري التحميل...</div>

  return (
    <div className="text-xl font-bold text-center text-amber-700">
      {timeLeft > 0 ? `الوقت المتبقي: ${formatTime(timeLeft)}` : "انتهى الوقت"}
    </div>
  )
}