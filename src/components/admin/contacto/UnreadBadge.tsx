type Props = { count: number }

export function UnreadBadge({ count }: Props) {
  if (count === 0) return null
  return (
    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold min-w-[18px] h-[18px] px-1">
      {count > 99 ? "99+" : count}
    </span>
  )
}
