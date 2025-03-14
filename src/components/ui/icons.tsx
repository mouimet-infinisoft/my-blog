'use client'

import {
  Calendar as CalendarIcon,
  ChevronRight as ChevronRightIcon,
  BookOpen as BookOpenIcon,
  Layers as LayersIcon,
} from 'lucide-react'

export const Calendar = CalendarIcon
export const ChevronRight = ChevronRightIcon
export const BookOpen = BookOpenIcon
export const Layers = LayersIcon

export function ArrowLeft(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}