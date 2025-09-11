import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  const attempts = useRef(0);
  const pollTimerId = useRef<number | null>(null);

  // Using useCallback to create a stable function that won't be recreated on re-renders,
  // preventing issues with stale closures in setTimeout.
  const verifyPurchase = useCallback(async () => {
    // Clear any existing timer to prevent parallel polling loops
    if (pollTimerId.current) {
        clearTimeout(pollTimerId.current);
    }
    
    if (attempts.current >= MAX_ATTEMPTS) {
      setStatus('error');
      setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
      localStorage.removeItem('coinbase_charge_code');
      return;
    }
    
    attempts.current++;

    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/get-download-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chargeCode }),
      });
      
      if (response.status === 202) { // Pending
        setStatus('pending');
        // Continue polling
        pollTimerId.current = window.setTimeout(verifyPurchase, POLLING_INTERVAL);
        return;
      }
      
      if (response.ok) { // Success
         const data = await response.json();
         setDownloadUrl(data.url);
         if(data.trackName) setTrackName(data.trackName);
         setStatus('success');
         localStorage.removeItem('coinbase_charge_code');
         return; // Stop polling
      }

      // Handle non-ok responses (4xx, 5xx)
      let errorMessage = 'An error occurred during verification.';
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({ error: 'Could not parse error response.' }));
        errorMessage = errorData.error || `Server responded with status: ${response.status}`;
      } else {
        const errorText = await response.text();
        console.error("Server returned a non-JSON error response:", errorText.substring(0, 500));
        errorMessage = `Could not verify purchase. The server returned an unexpected response. Please try again later or contact support. (Status: ${response.status})`;
      }
      throw new Error(errorMessage);
      
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      localStorage.removeItem('coinbase_charge_code');
    }
  }, []); // Empty dependency array means this function is created only once.


  useEffect(() => {
    verifyPurchase();

    // This cleanup function is crucial for stopping polling if the user navigates away.
    return () => {
        if (pollTimerId.current) {
            clearTimeout(pollTimerId.current);
        }
    };
  }, [verifyPurchase]); // Effect depends on our stable verifyPurchase function.

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <SpinnerIcon />
            <h2 className="text-3xl font-bold mt-4">Verifying Your Purchase...</h2>
            <p className="text-gray-300 mt-2">Please wait a moment.</p>
          </div>
        );
      case 'pending':
         return (
          <div className="text-center">
            <SpinnerIcon />
            <h2 className="text-3xl font-bold mt-4">Waiting for Confirmation...</h2>
            <p className="text-gray-300 mt-2">Your payment has been detected. We are waiting for the transaction to be confirmed on the blockchain. This can take a few moments.</p>
             <p className="text-gray-400 mt-2">Please keep this page open.</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon />
            <h2 className="text-3xl font-bold mt-4">Payment Confirmed!</h2>
            <p className="text-gray-300 my-4">Thank you for your purchase. You can now download "{trackName}". The link will expire shortly.</p>
            <a
              href={downloadUrl ?? '#'}
              download
              className="mt-6 inline-flex items-center gap-2 max-w-xs w-full justify-center py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              aria-disabled={!downloadUrl}
            >
              <DownloadIcon />
              Download Now
            </a>
          </div>
        );
      case 'error':
        return (
           <div className="text-center">
            <h2 className="text-3xl font-bold mt-4 text-red-400">Verification Failed</h2>
            <p className="text-gray-300 my-4">{error}</p>
            <a
              href="/"
              className="mt-6 inline-flex items-center gap-2 max-w-xs w-full justify-center py-3 bg-gray-600 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Return to Home
            </a>
          </div>
        )
    }
  };

  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sm:p-12">
        {renderContent()}
      </div>
    </main>
  );
};

  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sm:p-12">
        {renderContent()}
      </div>
    </main>
  );
};
