/** Decorative SVGs for hero / sections — keep aria-hidden. */

export function ArrowToCta({ className }) {
  return (
    <svg
      className={className}
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 20 C 40 5, 70 5, 95 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="6 4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M88 18 L 98 28 L 95 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function SquiggleConnector({ className }) {
  return (
    <svg
      className={className}
      width="200"
      height="40"
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 25 Q 50 5, 100 20 T 200 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="5 5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
