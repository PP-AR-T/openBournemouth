import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export function SectionCard({
  id,
  children,
}: {
  id?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card className="p-4 sm:p-5">{children}</Card>
    </section>
  )
}
