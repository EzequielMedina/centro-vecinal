type Props = { hasUnread: boolean }

export function UnreadBadge({ hasUnread }: Props) {
  if (!hasUnread) return null
  return (
    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold w-[18px] h-[18px]">
      !
    </span>
  )
}
