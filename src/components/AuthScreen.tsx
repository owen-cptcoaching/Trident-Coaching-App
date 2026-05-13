import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (signUpError) throw signUpError;
        if (data.user && data.user.identities && data.user.identities.length === 0) {
            throw new Error("Email already registered, please sign in.");
        }
        alert("Check your email for the confirmation link, or attempt to sign in if auto-confirm is enabled.");
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;

      if (data?.url) {
        // Open the URL directly in a popup
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          data.url,
          'oauth_popup',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // We listen for the postMessage from the popup in the parent App component (using useEffect)
      } else {
        throw new Error("Could not get OAuth URL. Make sure Google is enabled in your Supabase Auth settings.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#F9F8F6] px-4 font-sans text-stone-900">
      <div className="max-w-md w-full bg-white p-12 border border-stone-200 text-center shadow-sm">
        <h1 className="text-6xl font-logo tracking-tight font-normal mb-2 leading-none">Trident</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 font-oswald mb-12">
          Elite Performance Coaching
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold border border-red-200 uppercase tracking-widest text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          {isSignUp && (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
              required
            />
          </div>
          {isSignUp && (
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || !email || !password || (isSignUp && (!username || !confirmPassword || password !== confirmPassword))}
            className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-stone-200"></div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">OR</span>
          <div className="flex-1 h-px bg-stone-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-900 px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors disabled:opacity-50 mb-6"
        >
          {isLoading ? (
            'Loading...'
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                 <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <p className="text-xs text-stone-500">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-stone-900 underline hover:text-stone-700"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>

      </div>
    </div>
  );
}
