'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, apiFetch } from '@/lib/api';
import LoginModal from '@/components/ui/LoginModal';

/**
 * OAuth Authorization Content
 * Inner component that uses useSearchParams
 */
function OAuthAuthorizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'checking' | 'authorizing' | 'needs_login' | 'error'>('checking');
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState<string>('');

  // Mark as mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Main authorization logic
  useEffect(() => {
    if (!mounted) return;

    const checkAndAuthorize = async () => {
      try {
        console.log('Starting OAuth authorization check...');
        
        // Get OAuth params from URL
        const clientId = searchParams.get('client_id');
        const redirectUri = searchParams.get('redirect_uri');
        const state = searchParams.get('state');
        const scope = searchParams.get('scope');
        const responseType = searchParams.get('response_type');
        
        console.log('OAuth params:', { clientId, redirectUri, state, responseType });

        // Validate required parameters
        if (!clientId || !redirectUri || !state || !responseType) {
          console.error('Missing OAuth params');
          setStatus('error');
          setError('Missing required OAuth parameters');
          return;
        }

        // Check authentication
        const authenticated = isAuthenticated();
        console.log('Authenticated:', authenticated);
        
        if (!authenticated) {
          console.log('User not authenticated, showing login');
          setStatus('needs_login');
          setShowLogin(true);
          return;
        }

        // User is logged in - proceed with authorization
        await doAuthorization({ clientId, redirectUri, state, scope });

      } catch (err: any) {
        console.error('OAuth check error:', err);
        setStatus('error');
        setError(err.message || 'Authorization failed');
      }
    };

    checkAndAuthorize();
  }, [mounted, searchParams]);

  const doAuthorization = async (params: any) => {
    try {
      setStatus('authorizing');
      
      // Decode the redirect_uri in case it's URL-encoded
      const decodedRedirectUri = decodeURIComponent(params.redirectUri);
      console.log('Calling /oauth/authorize/ with redirect_uri:', decodedRedirectUri);

      const res = await apiFetch('/oauth/authorize/', {
        method: 'POST',
        body: JSON.stringify({
          client_id: params.clientId,
          redirect_uri: decodedRedirectUri,
          state: params.state,
          scope: params.scope || 'openid profile',
        }),
      });

      console.log('Authorize response:', res);

      const redirectUrl = res?.data?.redirect_url || res?.redirect_url;
      
      if (redirectUrl) {
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        setStatus('error');
        setError('No redirect URL returned');
      }
    } catch (err: any) {
      console.error('Authorization error:', err);
      setStatus('error');
      setError(err.message || 'Authorization failed');
    }
  };

  const handleLoginSuccess = useCallback(async () => {
    console.log('Login success');
    setShowLogin(false);
    
    // Re-run authorization after login
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');
    const scope = searchParams.get('scope');
    
    if (clientId && redirectUri && state) {
      await doAuthorization({ clientId, redirectUri, state, scope });
    }
  }, [searchParams]);

  const handleLoginClose = useCallback(() => {
    setShowLogin(false);
    setStatus('error');
    setError('Login required');
  }, []);

  // Loading state
  if (!mounted || status === 'checking' || status === 'authorizing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07060F] text-white">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-medium">
            {!mounted ? 'Loading...' : status === 'checking' ? 'Checking session...' : 'Authorizing...'}
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07060F] text-white p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center text-4xl">
            ⚠️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Authorization Failed</h2>
            <p className="text-gray-400">{error}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl">
              Go Home
            </button>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 border border-gray-600 hover:bg-gray-800 rounded-xl">
              Try Again
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLogin} onClose={handleLoginClose} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Needs login
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07060F] text-white p-4">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-medium">Sign in required</h2>
          <p className="text-gray-400">Please sign in to continue</p>
        </div>
      </div>
      <LoginModal isOpen={showLogin} onClose={handleLoginClose} onLoginSuccess={handleLoginSuccess} />
    </>
  );
}

/**
 * OAuth Authorization Page
 * Wrapped in Suspense for useSearchParams
 */
export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#07060F] text-white">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-medium">Loading...</h2>
        </div>
      </div>
    }>
      <OAuthAuthorizeContent />
    </Suspense>
  );
}
