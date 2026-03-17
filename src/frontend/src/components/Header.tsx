import { useQueryClient } from "@tanstack/react-query";
import { Film } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "./ui/button";

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [logoHovered, setLogoHovered] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === "logging-in";
  const buttonText =
    loginStatus === "logging-in"
      ? "Logging in..."
      : isAuthenticated
        ? "Logout"
        : "Login";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error("Login error:", error);
        if (error.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header
      className="sticky top-0 z-50 glass-header"
      data-ocid="header.section"
    >
      <div className="container flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 cursor-default"
            style={{
              background: logoHovered
                ? "rgba(180,40,30,0.18)"
                : "rgba(255,255,255,0.06)",
              border: logoHovered
                ? "1px solid rgba(180,40,30,0.40)"
                : "1px solid rgba(255,255,255,0.10)",
            }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
          >
            <Film
              className="w-4 h-4 transition-colors duration-300"
              style={{
                color: logoHovered
                  ? "oklch(70% 0.15 22)"
                  : "rgba(255,255,255,0.70)",
              }}
            />
          </div>
          <h1
            className="text-lg font-bold tracking-tight text-gradient-gold italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Bree's Favorites
          </h1>
        </div>

        <Button
          onClick={handleAuth}
          disabled={disabled}
          data-ocid="header.button"
          className="text-white/80 hover:text-white text-sm font-medium transition-all duration-200"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          {buttonText}
        </Button>
      </div>
    </header>
  );
}
