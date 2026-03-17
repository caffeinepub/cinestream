import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertCircle, Loader2, Play, X } from "lucide-react";
import { useGetTrailer } from "../hooks/useQueries";

interface TrailerModalProps {
  mediaType: "movie" | "tv";
  mediaId: number;
  mediaTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TrailerModal({
  mediaType,
  mediaId,
  mediaTitle,
  open,
  onOpenChange,
}: TrailerModalProps) {
  const {
    data: trailerKey,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTrailer(mediaType, mediaId, open);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay
          className="fixed inset-0 z-[9998]"
          style={{
            background: "rgba(0, 0, 0, 0.80)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[95vw] max-w-5xl rounded-2xl overflow-hidden"
          style={{
            background: "rgba(8, 8, 18, 0.85)",
            backdropFilter: "blur(48px) saturate(200%)",
            WebkitBackdropFilter: "blur(48px) saturate(200%)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow:
              "0 32px 100px rgba(0,0,0,0.80), 0 0 0 1px rgba(245,200,66,0.06) inset, 0 0 60px rgba(220,38,38,0.08)",
          }}
          aria-describedby={undefined}
          data-ocid="trailer.dialog"
        >
          <DialogTitle className="sr-only">{mediaTitle} Trailer</DialogTitle>

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              background:
                "linear-gradient(90deg, rgba(220,38,38,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-red-400" />
              <span
                className="text-white text-base font-semibold truncate max-w-[60vw]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {mediaTitle}
              </span>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                data-ocid="trailer.close_button"
                className="rounded-full p-1.5 text-white/60 hover:text-white transition-all duration-200 hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
                aria-label="Close trailer"
              >
                <X className="w-4 h-4" />
              </button>
            </DialogClose>
          </div>

          {/* Video area */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            {isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.50)" }}
                data-ocid="trailer.loading_state"
              >
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-red-400 animate-spin mx-auto" />
                  <p className="text-white/70 text-sm">Loading trailer...</p>
                </div>
              </div>
            )}

            {isError && (
              <div
                className="absolute inset-0 flex items-center justify-center p-8"
                style={{ background: "rgba(0,0,0,0.50)" }}
                data-ocid="trailer.error_state"
              >
                <div className="text-center space-y-4 max-w-md">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      background: "rgba(220,38,38,0.12)",
                      border: "1px solid rgba(220,38,38,0.25)",
                    }}
                  >
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      Unable to Load Trailer
                    </p>
                    <p className="text-white/50 text-sm">
                      {error instanceof Error
                        ? error.message
                        : "An error occurred while fetching the trailer."}
                    </p>
                  </div>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    data-ocid="trailer.confirm_button"
                    className="text-white hover:text-white"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border: "1px solid rgba(255,255,255,0.20)",
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !isError && !trailerKey && (
              <div
                className="absolute inset-0 flex items-center justify-center p-8"
                style={{ background: "rgba(0,0,0,0.50)" }}
              >
                <div className="text-center space-y-4 max-w-md">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <Play className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-semibold">
                      No Trailer Available
                    </p>
                    <p className="text-white/50 text-sm">
                      A trailer for this{" "}
                      {mediaType === "movie" ? "movie" : "show"} is not
                      currently available.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !isError && trailerKey && (
              <iframe
                key={trailerKey}
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&rel=0&modestbranding=1`}
                title={`${mediaTitle} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
