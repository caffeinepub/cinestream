import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FeaturedRow from './components/FeaturedRow';
import NetflixTop10 from './components/NetflixTop10';
import ApiHealthBanner from './components/ApiHealthBanner';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import { Toaster } from './components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

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
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Apply query defaults at runtime
  useEffect(() => {
    queryClient.setDefaultOptions({
      queries: {
        refetchOnWindowFocus: false,
        retry: 2,
      },
    });
  }, [queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <Header />
      <main className="flex-1">
        <ApiHealthBanner />
        <Hero />
        <div className="space-y-12 pb-16">
          <NetflixTop10 />
          <FeaturedRow />
        </div>
      </main>
      <Footer />
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
