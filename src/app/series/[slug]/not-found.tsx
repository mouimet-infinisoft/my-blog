import { SimpleLayout } from '@/components/SimpleLayout'

export default function NotFound() {
  return (
    <SimpleLayout
      title="Series not found"
      intro="Sorry, the requested series does not exist or has been moved."
    />
  )
}