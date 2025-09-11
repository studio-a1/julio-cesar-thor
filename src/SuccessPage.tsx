import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    let attempts = 0;
    let pollTimerId: number | undefined;

    const verifyPurchase = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
        localStorage.removeItem('coinbase_charge_code');
        return;
      }
      
      attempts++;

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
          // continue polling
          pollTimerId = window.setTimeout(verifyPurchase, POLLING_INTERVAL);
          return;
        }
        
        if (response.ok) { // Success
           const data = await response.json();
           setDownloadUrl(data.url);
           if(data.trackName) setTrackName(data.trackName);
           setStatus('success');
           localStorage.removeItem('coinbase_charge_code');
           return; // Stop polling on success
        }

        // Handle non-ok responses (4xx, 5xx)
        let errorMessage = 'An error occurred during verification.';
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({ error: 'Could not parse error response.' }));
          errorMessage = errorData.error || `Server responded with status: ${response.status}`;
        } else {
          // This block runs if response is not JSON (e.g., HTML error page).
          const errorText = await response.text();
          console.error("Server returned a non-JSON error response:", errorText.substring(0, 500));
          errorMessage = `Could not verify purchase. The server returned an unexpected response. Please try again later or contact support. (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
        
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        localStorage.removeItem('coinbase_charge_code');
        // The useEffect cleanup will handle clearing any active timer.
      }
    };

    verifyPurchase();

    // This cleanup function is crucial. It runs when the component unmounts.
    return () => {
        if (pollTimerId) {
            clearTimeout(pollTimerId);
        }
    };
  }, []);

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


/*import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    let attempts = 0;

    const verifyPurchase = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
        localStorage.removeItem('coinbase_charge_code');
        return;
      }
      
      attempts++;

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
          // continue polling
          setTimeout(verifyPurchase, POLLING_INTERVAL);
          return;
        }
        
        if (response.ok) { // Success
           const data = await response.json();
           setDownloadUrl(data.url);
           if(data.trackName) setTrackName(data.trackName);
           setStatus('success');
           localStorage.removeItem('coinbase_charge_code');
           return;
        }

        // Handle non-ok responses (4xx, 5xx)
        let errorMessage = 'An error occurred during verification.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Server responded with status: ${response.status}`;
        } catch (e) {
          // This catch block runs if response.json() fails.
          // It means the server sent a non-JSON response (like an HTML error page).
          errorMessage = `Could not verify purchase. The server returned an unexpected response. Please try again later or contact support. (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
        
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        localStorage.removeItem('coinbase_charge_code');
      }
    };

    verifyPurchase();
  }, []);

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



/*import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    let attempts = 0;

    const verifyPurchase = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
        localStorage.removeItem('coinbase_charge_code');
        return;
      }
      
      attempts++;

      try {
        const response = await fetch('/api/get-download-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chargeCode }),
        });

        // Handle non-successful responses first
        if (!response.ok) {
          // Status 202 is a valid, non-error state for pending transactions
          if (response.status === 202) {
            setStatus('pending');
            setTimeout(verifyPurchase, POLLING_INTERVAL);
            return; // Stop processing this attempt
          }

          // For other errors, try to get a JSON message, otherwise show a generic error.
          let errorMessage = 'An error occurred during verification.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || `Server responded with status: ${response.status}`;
          } catch (e) {
            // This catch block runs if response.json() fails, which is the user's issue.
            // It means the server sent a non-JSON response (like an HTML error page).
            errorMessage = `Could not verify purchase. The server returned an unexpected response. Please try again later or contact support. (Status: ${response.status})`;
          }
          throw new Error(errorMessage);
        }
        
        // If we get here, response.ok is true (status 200-299)
        const data = await response.json();
        setDownloadUrl(data.url);
        if (data.trackName) setTrackName(data.trackName);
        setStatus('success');
        localStorage.removeItem('coinbase_charge_code');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown network error occurred.');
        localStorage.removeItem('coinbase_charge_code');
      }
    };

    verifyPurchase();
  }, []);

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




/*import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    let attempts = 0;

    const verifyPurchase = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
        localStorage.removeItem('coinbase_charge_code');
        return;
      }
      
      attempts++;

      try {
        const response = await fetch('/.netlify/functions/get-download-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chargeCode }),
        });

        // Handle non-successful responses first
        if (!response.ok) {
          // Status 202 is a valid, non-error state for pending transactions
          if (response.status === 202) {
            setStatus('pending');
            setTimeout(verifyPurchase, POLLING_INTERVAL);
            return; // Stop processing this attempt
          }

          // For other errors, try to get a JSON message, otherwise show a generic error.
          let errorMessage = 'An error occurred during verification.';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || `Server responded with status: ${response.status}`;
          } catch (e) {
            // This catch block runs if response.json() fails, which is the user's issue.
            // It means the server sent a non-JSON response (like an HTML error page).
            errorMessage = `Could not verify purchase. The server returned an unexpected response. Please try again later or contact support. (Status: ${response.status})`;
          }
          throw new Error(errorMessage);
        }
        
        // If we get here, response.ok is true (status 200-299)
        const data = await response.json();
        setDownloadUrl(data.url);
        if (data.trackName) setTrackName(data.trackName);
        setStatus('success');
        localStorage.removeItem('coinbase_charge_code');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown network error occurred.');
        localStorage.removeItem('coinbase_charge_code');
      }
    };

    verifyPurchase();
  }, []);

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





/*import React, { useState, useEffect } from 'react';
import { SpinnerIcon, CheckCircleIcon, DownloadIcon } from './components/Icons';

type Status = 'verifying' | 'success' | 'error' | 'pending';

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_ATTEMPTS = 24; // 2 minutes max polling

export const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<Status>('verifying');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('your track');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const chargeCode = localStorage.getItem('coinbase_charge_code');
    if (!chargeCode) {
      setStatus('error');
      setError('No payment charge code found. Could not verify purchase.');
      return;
    }

    let attempts = 0;

    const verifyPurchase = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        setStatus('error');
        setError('Verification timed out. Please check your wallet for transaction status and contact support if payment was sent.');
        localStorage.removeItem('coinbase_charge_code');
        return;
      }
      
      attempts++;

      try {
        const response = await fetch('/.netlify/functions/get-download-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ chargeCode }),
        });
        
        const data = await response.json();

        if (response.status === 202) { // Pending
          setStatus('pending');
          // continue polling
          setTimeout(verifyPurchase, POLLING_INTERVAL);
        } else if (response.ok) { // Success
           setDownloadUrl(data.url);
           if(data.trackName) setTrackName(data.trackName);
           setStatus('success');
           localStorage.removeItem('coinbase_charge_code');
        } else { // Error
          throw new Error(data.error || 'Failed to verify purchase.');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        localStorage.removeItem('coinbase_charge_code');
      }
    };

    verifyPurchase();
  }, []);

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
};*/
