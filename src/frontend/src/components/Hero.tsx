export default function Hero() {
  return (
    <section
      className="relative h-[55vh] min-h-[400px] overflow-hidden flex items-center justify-center"
      style={{ background: "oklch(6% 0.008 55)" }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary orb — warm crimson */}
        <div
          className="absolute rounded-full"
          style={{
            top: "33%",
            left: "25%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, oklch(52% 0.20 22) 0%, transparent 70%)",
            filter: "blur(100px)",
            transform: "translate(-50%, -50%)",
            opacity: 0.12,
          }}
        />
        {/* Secondary orb — warm amber */}
        <div
          className="absolute rounded-full"
          style={{
            top: "50%",
            right: "25%",
            width: "350px",
            height: "350px",
            background:
              "radial-gradient(circle, oklch(75% 0.12 70) 0%, transparent 70%)",
            filter: "blur(80px)",
            transform: "translate(50%, -50%)",
            opacity: 0.07,
          }}
        />
        {/* Bottom dark vignette */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40"
          style={{
            background:
              "linear-gradient(to top, oklch(6% 0.008 55), transparent)",
          }}
        />
      </div>

      {/* Decorative thin vertical line */}
      <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none">
        <div
          className="w-px h-16 opacity-20"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />
      </div>

      <div className="relative text-center space-y-5 max-w-3xl px-8">
        {/* Category pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-[0.15em] font-medium opacity-0 animate-fade-up"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "oklch(54% 0.01 80)",
            fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse inline-block" />
          Updated Daily
        </div>

        {/* Main headline */}
        <h1
          className="text-5xl md:text-[68px] font-bold leading-[0.95] tracking-[-0.025em] text-gradient-cream opacity-0 animate-fade-up-delay-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
          }}
        >
          Trending
          <br />
          <span
            className="not-italic"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: "0.62em",
              letterSpacing: "-0.01em",
              WebkitTextFillColor: "unset",
              background: "none",
              color: "oklch(40% 0.008 80)",
            }}
          >
            This Year
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="text-base text-white/40 font-light tracking-wide opacity-0 animate-fade-up-delay-2"
          style={{ fontFamily: "'Figtree', sans-serif" }}
        >
          Movies &amp; TV shows worth watching
        </p>
      </div>
    </section>
  );
}
