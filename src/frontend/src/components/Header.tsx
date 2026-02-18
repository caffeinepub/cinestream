import { Film } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const buttonText = loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1a1a2e]/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Bree's Favorites</h1>
        </div>
        <Button
          onClick={handleAuth}
          disabled={disabled}
          variant={isAuthenticated ? 'outline' : 'default'}
          className={
            isAuthenticated
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        >
          {buttonText}
        </Button>
      </div>
    </header>
  );
}
