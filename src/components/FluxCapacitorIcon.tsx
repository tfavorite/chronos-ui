interface FluxCapacitorIconProps {
  size?: number
}

// A Y-shaped flux capacitor: three arms meeting at a core, with a node at each tip.
// Uses currentColor, so it takes the text color of wherever it is placed.
export function FluxCapacitorIcon({ size = 24 }: FluxCapacitorIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 13 L4.5 4.5 M12 13 L19.5 4.5 M12 13 V20" />
      <circle cx="12" cy="13" r="2.4" fill="currentColor" />
      <circle cx="4.5" cy="4.5" r="1.6" fill="currentColor" />
      <circle cx="19.5" cy="4.5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="20.5" r="1.6" fill="currentColor" />
    </svg>
  )
}
