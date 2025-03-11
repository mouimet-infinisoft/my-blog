import Link from 'next/link'
import clsx from 'clsx'

const variantStyles = {
  primary:
    'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700',
  secondary:
    'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-600',
  link:
    'text-teal-500 hover:text-teal-600 active:text-teal-700',
}

type ButtonProps = {
  variant?: keyof typeof variantStyles
  className?: string
} & (
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
  | React.ComponentPropsWithoutRef<typeof Link>
)

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonProps) {
  className = clsx(
    'inline-flex items-center justify-center rounded-md py-2 px-4 text-sm font-medium transition',
    variantStyles[variant],
    className,
  )

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  )
}
