import { Film, LogIn, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from './ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Failed to log in');
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel glass-shadow">
      <div className="container flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary glass-glow glass-shadow neon-glow">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white text-glass">CineStream</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && userProfile && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-white/70 text-glass">Welcome,</span>
              <span className="font-medium text-white text-glass">{userProfile.name}</span>
            </div>
          )}
          <Button
            onClick={handleAuth}
            disabled={isLoggingIn}
            variant={isAuthenticated ? 'outline' : 'default'}
            size="sm"
            className={`gap-2 rounded-full transition-all duration-300 glass-glow ${
              isAuthenticated 
                ? 'glass-panel border-white/30 text-white hover:glass-panel-strong hover:border-white/40 hover:scale-105 glass-shadow' 
                : 'bg-primary hover:bg-primary/90 text-white border-0 hover:scale-105 glass-shadow-lg neon-glow'
            }`}
          >
            {isLoggingIn ? (
              <>Logging in...</>
            ) : isAuthenticated ? (
              <>
                <LogOut className="h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

