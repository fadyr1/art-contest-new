"use client"

import { createContext, useContext, useState } from "react"

type CountdownContextType = {
  hasEnded: boolean
  setHasEnded: (value: boolean) => void
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined)

export const CountdownProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasEnded, setHasEnded] = useState(false)

  return (
    <CountdownContext.Provider value={{ hasEnded, setHasEnded }}>
      {children}
    </CountdownContext.Provider>
  )
}

export const useCountdown = () => {
  const context = useContext(CountdownContext)
  if (!context) throw new Error("useCountdown must be used within CountdownProvider")
  return context
}
