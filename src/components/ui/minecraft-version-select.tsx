import { MINECRAFT_VERSIONS } from "../../lib/minecraftVersions"
import { cn } from "../../lib/utils"

interface MinecraftVersionSelectProps {
  id?: string
  value: string
  onChange: (version: string) => void
  className?: string
}

function MinecraftVersionSelect({ id, value, onChange, className }: MinecraftVersionSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border-input flex h-9 w-full min-w-0 border bg-card-darker px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none cursor-pointer md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        className
      )}
    >
      {MINECRAFT_VERSIONS.map((entry) => (
        <option key={entry.version} value={entry.version}>
          {entry.label ? `${entry.version} (${entry.label})` : entry.version}
        </option>
      ))}
    </select>
  )
}

export { MinecraftVersionSelect }
