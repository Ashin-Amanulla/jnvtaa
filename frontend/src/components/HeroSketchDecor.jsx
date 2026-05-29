/** Decorative accents for hero / sections — keep aria-hidden. */

/** Soft blurred colour blob — modern ambient decor. */
export function HeroBlob({ className, color = "var(--house-blue)" }) {
  return (
    <div
      className={className}
      aria-hidden
      style={{
        background: color,
        filter: "blur(64px)",
        opacity: 0.18,
        borderRadius: "9999px",
      }}
    />
  );
}

/** Retained for back-compat: previously a dashed arrow. Now renders nothing
 *  intrusive — a subtle chevron accent in the brand colour. */
export function ArrowToCta({ className }) {
  return (
    <svg
      className={className}
      width="64"
      height="48"
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 14 C 24 6, 42 6, 56 22"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 14 L 58 23 L 49 27"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/** Retained for back-compat: previously a dashed squiggle. Now a clean curve. */
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
        d="M0 25 Q 50 8, 100 20 T 200 15"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
