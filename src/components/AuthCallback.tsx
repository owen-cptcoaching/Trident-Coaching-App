import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Send the session directly to the opener and close this popup
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      }
    });

    // Fallback if no auth state change occurs within 2 seconds
    const timeout = setTimeout(() => {
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-stone-50 font-sans">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-logo">Trident</h1>
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">Authenticating...</p>
      </div>
    </div>
  );
}
