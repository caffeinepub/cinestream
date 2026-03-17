import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Tv, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTrackedShow,
  useGetTrackedShows,
  useRemoveTrackedShow,
} from "../hooks/useQueries";
import AddShowDialog from "./AddShowDialog";

const TMDB_API_KEY = "3d1cb94d909aab088231f5af899dffdc";

interface ShowDetails {
  id: number;
  name: string;
  last_air_date: string | null;
  poster_path: string | null;
}

function useShowDetails(showIds: string[]) {
  return useQuery<ShowDetails[]>({
    queryKey: ["trackedShowDetails", showIds],
    queryFn: async () => {
      const results = await Promise.all(
        showIds.map(async (id) => {
          const res = await fetch(
            `https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US`,
          );
          if (!res.ok) return null;
          return res.json() as Promise<ShowDetails>;
        }),
      );
      return results.filter((r): r is ShowDetails => r !== null);
    },
    enabled: showIds.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}

function isNewEpisode(lastAirDate: string | null): boolean {
  if (!lastAirDate) return false;
  const diff = Date.now() - new Date(lastAirDate).getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

function formatLastAirDate(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const date = new Date(dateStr);
  return `Last episode: ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function TrackedShows() {
  const { identity } = useInternetIdentity();
  const [addOpen, setAddOpen] = useState(false);

  const { data: showIds = [], isLoading: loadingIds } = useGetTrackedShows();
  const { data: shows = [], isLoading: loadingDetails } =
    useShowDetails(showIds);
  const addMutation = useAddTrackedShow();
  const removeMutation = useRemoveTrackedShow();

  if (!identity) return null;

  const handleAdd = async (showId: string) => {
    await addMutation.mutateAsync(showId);
  };

  const handleRemove = (showId: string) => {
    removeMutation.mutate(showId);
  };

  return (
    <TooltipProvider>
      <section
        className="mx-6 lg:mx-12 rounded-xl p-6 md:p-8 glass-panel"
        data-ocid="tracked.section"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <p
              className="text-xs uppercase tracking-[0.18em] mb-1 font-medium"
              style={{
                color: "oklch(60% 0.008 80)",
                fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
              }}
            >
              My Library
            </p>
            <h2
              className="text-2xl font-bold text-white flex items-center gap-2"
              style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              <Tv className="w-5 h-5" style={{ color: "oklch(55% 0.16 22)" }} />
              Tracked Shows
            </h2>
          </div>
          {/* Fading rule + button */}
          <div className="flex items-center gap-4 flex-1 ml-6">
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.10), transparent)",
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-white/70 hover:text-white flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
                fontFamily: "'Satoshi', 'Plus Jakarta Sans', sans-serif",
              }}
              onClick={() => setAddOpen(true)}
              data-ocid="tracked.open_modal_button"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Add Show
            </Button>
          </div>
        </div>

        {(loadingIds || loadingDetails) && (
          <div className="space-y-3" data-ocid="tracked.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="w-12 h-16 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />
                <div className="flex-1 space-y-2">
                  <div
                    className="h-4 rounded w-40"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                  <div
                    className="h-3 rounded w-28"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingIds && showIds.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 text-center"
            data-ocid="tracked.empty_state"
          >
            <Tv
              className="w-10 h-10 mb-3"
              style={{ color: "rgba(255,255,255,0.15)" }}
            />
            <p className="text-white/35 text-sm">
              No shows tracked yet. Add your favorites above.
            </p>
          </div>
        )}

        {!loadingIds && !loadingDetails && shows.length > 0 && (
          <ul className="space-y-2" data-ocid="tracked.list">
            {shows.map((show, idx) => {
              const hasNewEp = isNewEpisode(show.last_air_date);
              const posterUrl = show.poster_path
                ? `https://image.tmdb.org/t/p/w92${show.poster_path}`
                : null;

              return (
                <li
                  key={show.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  data-ocid={`tracked.item.${idx + 1}`}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={show.name}
                      className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-12 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                    >
                      <Tv className="w-5 h-5 text-white/25" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 font-medium text-sm truncate">
                        {show.name}
                      </span>
                      {hasNewEp && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>New Episode!</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <p className="text-white/35 text-xs mt-0.5">
                      {formatLastAirDate(show.last_air_date)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(show.id.toString())}
                    disabled={removeMutation.isPending}
                    className="p-1.5 rounded-full text-white/25 hover:text-white/70 transition-colors flex-shrink-0"
                    aria-label={`Remove ${show.name}`}
                    data-ocid={`tracked.delete_button.${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AddShowDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={handleAdd}
      />
    </TooltipProvider>
  );
}
