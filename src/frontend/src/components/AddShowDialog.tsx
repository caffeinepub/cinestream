import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, Search, Tv, X } from "lucide-react";
import { useEffect, useState } from "react";

const TMDB_API_KEY = "3d1cb94d909aab088231f5af899dffdc";

interface TVSearchResult {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
}

interface AddShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (showId: string) => Promise<void>;
}

export default function AddShowDialog({
  open,
  onOpenChange,
  onAdd,
}: AddShowDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TVSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}&language=en-US`,
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results?.slice(0, 8) ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleClose = () => {
    setSearchTerm("");
    setResults([]);
    onOpenChange(false);
  };

  const handleAdd = async (show: TVSearchResult) => {
    setAddingId(show.id);
    try {
      await onAdd(show.id.toString());
      handleClose();
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black/70 z-[9998]" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[95vw] max-w-lg bg-[#16213e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Add Show to Tracker</DialogTitle>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">
                Add Show to Tracker
              </h2>
              <DialogClose asChild>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close"
                  data-ocid="add_show.close_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a TV show..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-red-500/50"
                data-ocid="add_show.search_input"
              />
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
              {loading && (
                <div
                  className="flex items-center justify-center py-6"
                  data-ocid="add_show.loading_state"
                >
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              )}

              {!loading && searchTerm && results.length === 0 && (
                <div className="text-center py-6 text-white/40 text-sm">
                  No shows found for "{searchTerm}"
                </div>
              )}

              {!loading &&
                results.map((show, idx) => (
                  <button
                    type="button"
                    key={show.id}
                    onClick={() => handleAdd(show)}
                    disabled={addingId === show.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
                    data-ocid={`add_show.item.${idx + 1}`}
                  >
                    {show.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${show.poster_path}`}
                        alt={show.name}
                        className="w-10 h-14 object-cover rounded flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Tv className="w-4 h-4 text-white/30" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {show.name}
                      </p>
                      {show.first_air_date && (
                        <p className="text-white/40 text-xs mt-0.5">
                          {new Date(show.first_air_date).getFullYear()}
                        </p>
                      )}
                    </div>
                    {addingId === show.id && (
                      <Loader2 className="w-4 h-4 text-red-500 animate-spin ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
