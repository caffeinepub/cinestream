export default function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "unknown-app";

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="container py-5 px-6 flex items-center justify-between">
        <p
          className="text-xs"
          style={{
            color: "rgba(255,255,255,0.25)",
            fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          © {currentYear} Bree&apos;s Favorites
        </p>
        <p
          className="text-xs"
          style={{
            color: "rgba(255,255,255,0.20)",
            fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          Data by{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/40 transition-colors"
          >
            TMDB
          </a>
          {" · "}Built with{" "}
          <a
            href={`https://caffeine.ai/?utm_source=caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/40 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
