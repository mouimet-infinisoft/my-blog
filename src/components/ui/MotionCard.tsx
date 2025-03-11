'use client'

import { motion } from 'framer-motion'

export function MotionCard({
  children,
  index,
}: {
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {children}
    </motion.div>
  )
}