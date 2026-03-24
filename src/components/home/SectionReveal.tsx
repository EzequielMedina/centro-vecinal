"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SectionReveal({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      // initial=false → no aplica estilos inline en SSR, sin hydration mismatch
      // Antes de montar: sin animate → contenido visible
      // Después de montar: fade+slide según isInView
      initial={false}
      animate={
        !mounted
          ? {}
          : isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 24 }
      }
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
