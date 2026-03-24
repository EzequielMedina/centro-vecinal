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
  // Empieza en false para que el servidor y la hidratación inicial sean idénticos (sin styles inline)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Antes de montar: div sin estilos → el servidor y el cliente coinciden, sin hydration mismatch
  if (!mounted) {
    return <div ref={ref} className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
