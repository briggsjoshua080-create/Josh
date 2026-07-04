interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/** Single icon vocabulary: 1.5px stroke, rounded caps, 24px grid. */
const PATHS: Record<string, React.ReactNode> = {
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  handshake: (
    <path d="M3 11l4-4 5 2 4-3 5 4-3 3.5M6 12l4 4a1.6 1.6 0 0 0 2.4-.2M9 15l2.5 2.5a1.6 1.6 0 0 0 2.4-.2M12 17l1.5 1.5a1.6 1.6 0 0 0 2.4-.2l2.6-2.8" />
  ),
  book: (
    <path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1-2-2zM20 17H6a2 2 0 0 0-2 2M9 7h7" />
  ),
  glass: <path d="M8 3h8l-1 8a3 3 0 0 1-6 0zM12 14v6m-4 1h8" />,
  scale: (
    <path d="M12 3v18m-7 0h14M12 6l-6 2m6-2l6 2M6 8l-3 6a3.5 3.5 0 0 0 6 0zM18 8l-3 6a3.5 3.5 0 0 0 6 0z" />
  ),
  bolt: <path d="M13 2L5 13h6l-1 9 8-11h-6z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-8 8H4l2.3-2.9A8 8 0 1 1 21 12zM8 10h8m-8 4h5" />,
  shield: <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />,
  flame: (
    <path d="M12 21c-3.9 0-6.5-2.5-6.5-6 0-2.6 1.6-4.6 3-6.2C9.8 7.3 11 5.8 11 3.5c3 1.8 4 4.5 3.6 6.8 1-.3 1.8-1 2.2-2.1 1.3 1.6 1.7 3.5 1.7 4.8 0 5-3.1 8-6.5 8z" />
  ),
  chart: <path d="M4 20V4m0 16h16M8 16v-5m4 5V8m4 8v-3" />,
  stage: <path d="M3 20h18M5 20V9l7-5 7 5v11M9.5 20v-6h5v6" />,
  library: (
    <path d="M4 4h4v16H4zM10 4h4v16h-4zM16.5 5.2l3.9-.8 2.6 15-3.9.8z" transform="scale(0.86) translate(1.5 1.5)" />
  ),
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.7 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.7-4-9s1.4-6.5 4-9z" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5 10-11" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  arrowRight: <path d="M4 12h16m-6-6l6 6-6 6" />,
  arrowLeft: <path d="M20 12H4m6-6l-6 6 6 6" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  pause: <path d="M9 5v14M15 5v14" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  sparkle: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />,
  word: <path d="M4 6h16M4 12h16M4 18h9" />,
  refresh: <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" />,
  keyboard: (
    <>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <path d="M7 11h.01M11 11h.01M15 11h.01M7 14.5h.01M17 11h.01M10 14.5h5" />
    </>
  ),
};

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
