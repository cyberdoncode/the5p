import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  home: <path d="M3 9.5L10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5v-4.5h-5V17H4a1 1 0 0 1-1-1V9.5Z" />,
  planner: (
    <>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3M6.5 11.5h3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="14" height="13" rx="2" />
      <path d="M3 8h14M7 2.5v3M13 2.5v3" />
    </>
  ),
  tasks: (
    <>
      <path d="M3 5.5l2 2 3.5-3.5M3 13.5l2 2 3.5-3.5M11 6h6M11 14h6" />
    </>
  ),
  goals: (
    <>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="10" cy="10" r="0.6" fill="currentColor" />
    </>
  ),
  habits: (
    <path d="M10 2.5s4.5 3.6 4.5 7.6a4.5 4.5 0 0 1-9 0c0-1.6.8-2.9 1.6-3.8.2 1.2.9 2 1.7 2 .9 0 1.4-.9 1.2-2.4-.1-1.2-.4-2.4-1-3.4Z" />
  ),
  journal: (
    <>
      <path d="M5 3h9a2 2 0 0 1 2 2v12H6.5A1.5 1.5 0 0 1 5 15.5V3Z" />
      <path d="M5 3a1.5 1.5 0 0 0 0 3M8.5 7.5h5M8.5 10.5h5" />
    </>
  ),
  finance: (
    <>
      <path d="M3 16V8M7.6 16V4.5M12.2 16v-5M16.8 16V6.5" />
    </>
  ),
  notes: (
    <>
      <path d="M4 3.5h12v9l-4 4.5H4v-13Z" />
      <path d="M12 17v-4.5h4M7 7h6M7 10h4" />
    </>
  ),
  reviews: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.3l2.8 1.7" />
    </>
  ),
  settings: (
    <>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.6v1.8M10 15.6v1.8M17.4 10h-1.8M4.4 10H2.6M15.2 4.8l-1.3 1.3M6.1 13.9l-1.3 1.3M15.2 15.2l-1.3-1.3M6.1 6.1 4.8 4.8" />
    </>
  ),
  plus: <path d="M10 4v12M4 10h12" />,
  search: (
    <>
      <circle cx="9" cy="9" r="5.2" />
      <path d="M12.8 12.8 17 17" />
    </>
  ),
  arrow: <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />,
  chevronLeft: <path d="M12 5 7 10l5 5" />,
  chevronRight: <path d="M8 5l5 5-5 5" />,
  trash: (
    <>
      <path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6" />
    </>
  ),
  flame: (
    <path d="M10 2.5s4.5 3.6 4.5 7.6a4.5 4.5 0 0 1-9 0c0-1.6.8-2.9 1.6-3.8.2 1.2.9 2 1.7 2 .9 0 1.4-.9 1.2-2.4-.1-1.2-.4-2.4-1-3.4Z" />
  ),
  logout: <path d="M8 4H4.5A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H8M12 13l3-3-3-3M15 10H7" />,
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: keyof typeof paths | string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name] ?? paths.notes}
    </svg>
  );
}
