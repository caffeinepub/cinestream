import { useState } from 'react';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { useSearchTVShows, useAddTrackedShow, getImageUrl } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function AddShowDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults = [], isLoading: isSearching, error: searchError } = useSearchTVShows(searchQuery);
  const addShowMutation = useAddTrackedShow();
  const { identity } = useInternetIdentity();

  const handleAddShow = async (showId: number, showName: string) => {
    if (!identity) {
      toast.error('Please log in to track shows');
      return;
    }

    try {
      await addShowMutation.mutateAsync(showId.toString());
      toast.success(`Added "${showName}" to tracked list`);
      setOpen(false);
      setSearchQuery('');
    } catch (error: any) {
      console.error('Failed to add show:', error);
      
      let errorMessage = 'Failed to add show to tracked list';
      
      if (error?.message?.includes('Unauthorized')) {
        errorMessage = 'Please log in to track shows';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).getFullYear().toString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white glass-shadow-lg rounded-full transition-all duration-300 hover:scale-105 glass-glow neon-glow"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Show
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel-strong border-white/30 text-white max-w-2xl max-h-[80vh] flex flex-col rounded-2xl glass-shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-glass-strong">Add TV Show to Track</DialogTitle>
          <DialogDescription className="text-white/80 text-glass">
            Search for a TV show to add to your tracked list
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <Input
            placeholder="Search for a TV show..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-panel border-white/30 text-white placeholder:text-white/50 rounded-xl backdrop-blur-md"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : searchError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-white/90 mb-2 text-glass">Unable to search for shows</p>
              <p className="text-sm text-white/70 text-glass">
                {searchError instanceof Error ? searchError.message : 'Please check your connection and try again'}
              </p>
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="flex items-center justify-center py-12 text-white/70 text-glass">
              Start typing to search for TV shows
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-white/70 text-glass">
              No shows found for "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((show) => (
                <div
                  key={show.id}
                  className="flex gap-4 p-4 rounded-xl glass-panel hover:glass-panel-strong transition-all duration-300 border-white/20 hover:border-white/30 hover-lift glass-glow luminous-highlight"
                >
                  <div className="shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-black/30 glass-shadow">
                    <img
                      src={getImageUrl(show.poster_path, 'w500')}
                      alt={show.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold text-white line-clamp-1 text-glass">
                      {show.name}
                    </h3>
                    <p className="text-sm text-white/70 text-glass">
                      {formatDate(show.first_air_date)}
                    </p>
                    {show.overview && (
                      <p className="text-sm text-white/60 line-clamp-2 text-glass">
                        {show.overview}
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddShow(show.id, show.name)}
                    disabled={addShowMutation.isPending}
                    className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-300 hover:scale-105 glass-shadow neon-glow"
                  >
                    {addShowMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

