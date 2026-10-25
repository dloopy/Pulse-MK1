// src/components/BackLink.jsx
// When Pulse is opened from danisosa.com (served under /project/pulse/), a quiet link leads back to
// the work. On its own domain there is nowhere to go back to, so it stays hidden.
export function BackLink() {
  if (typeof window === 'undefined' || !window.location.pathname.startsWith('/project/pulse')) return null
  return (
    <a className="back-link" href="/work">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 12H4M10 6l-6 6 6 6" />
      </svg>
      Daniel Sosa · Work
    </a>
  )
}
