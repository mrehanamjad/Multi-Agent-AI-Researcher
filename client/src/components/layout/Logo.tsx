import { Telescope } from 'lucide-react'


function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <Telescope className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">Agentic Research</p>
          <p className="text-[11px] text-muted-foreground">Assistant</p>
        </div>
      </div>
  )
}

export default Logo