import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import TrackedShows from './components/TrackedShows';
import FeaturedRow from './components/FeaturedRow';
import ContentGrid from './components/ContentGrid';
import TrailerModal from './components/TrailerModal';
import Footer from './components/Footer';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import ApiHealthBanner from './components/ApiHealthBanner';
import { Toaster } from './components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useTMDBHealth } from './hooks/useQueries';
import { devLog } from './lib/devDiagnostics';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv';
  popularity?: number;
}

function AppContent() {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: apiHealth } = useTMDBHealth();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Apply query defaults at runtime to the main QueryClient
  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    });
  }, [queryClient]);

  // Handle media selection with stable state management
  const handleMediaClick = useCallback((media: MediaItem) => {
    devLog.mediaSelection('Media clicked', {
      mediaId: media.id,
      mediaType: media.media_type,
      isOpen: true,
    });
    setSelectedMedia(media);
    setIsDialogOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    devLog.mediaSelection('Modal closing', {
      mediaId: selectedMedia?.id,
      mediaType: selectedMedia?.media_type,
      isOpen: false,
    });
    setIsDialogOpen(false);
    // Small delay before clearing media to allow dialog close animation
    setTimeout(() => setSelectedMedia(null), 150);
  }, [selectedMedia]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {apiHealth && !apiHealth.isHealthy && <ApiHealthBanner status={apiHealth} />}
      {!isInitializing && isAuthenticated && <TrackedShows />}
      <main className="flex-1">
        <FeaturedRow onMediaClick={handleMediaClick} />
        <ContentGrid onMediaClick={handleMediaClick} />
      </main>
      <Footer />
      <TrailerModal
        media={selectedMedia}
        isOpen={isDialogOpen}
        onClose={handleCloseModal}
      />
      {showProfileSetup && <ProfileSetupDialog />}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
