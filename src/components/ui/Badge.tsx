import clsx from 'clsx'

const variantStyles = {
  primary: 'bg-teal-500 text-white',
  secondary: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
}

type BadgeProps = {
  variant?: keyof typeof variantStyles
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'primary', className, children }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  )
}
