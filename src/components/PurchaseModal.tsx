import React, { useState, useEffect } from 'react';
import type { Track } from '../types';
import { CloseIcon, SpinnerIcon } from './Icons';

// Simple SVG icon for generic crypto
const CryptoIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm3.336 14.873l-1.428-.825a.5.5 0 01-.252-.434V11.25a.5.5 0 01.5-.5h1.404a.5.5 0 01.5.5v2.691a.5.5 0 01-.252.432l-1.476.85zm-6.672 0l-1.476-.85a.5.5 0 01-.252-.432V11.25a.5.5 0 01.5-.5h1.404a.5.5 0 01.5.5v2.366a.5.5 0 01-.252.434l-1.428.825zm5.002-5.744l-1.428-.825a.5.5 0 01-.252-.434V5.5a.5.5 0 01.5-.5h1.404a.5.5 0 01.5.5v2.366a.5.5 0 01-.252.434l-1.476.85zm-6.672 0l-1.476-.85a.5.5 0 01-.252-.434V5.5a.5.5 0 01.5-.5h1.404a.5.5 0 01.5.5v2.691a.5.5 0 01-.252.432l-1.428.825z" />
    </svg>
);


interface PurchaseModalProps {
  track: Track;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ track, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/create-coinbase-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          trackName: track.title, 
          trackId: track.id,
          price: track.price.toString(),
          track_filename: track.fileName, // Use a new key to avoid potential conflicts
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create payment charge.';
        try {
          // Try to get a specific error message from the server
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          } else {
            errorMessage = `An unexpected error occurred. (Status: ${response.status})`;
          }
        } catch (e) {
          // Response body is not JSON or is empty
          errorMessage = `An unexpected server error occurred. Please try again later. (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const { hosted_url, code } = await response.json();
      if (hosted_url && code) {
        // Store charge code to verify it on the success page
        localStorage.setItem('coinbase_charge_code', code);
        window.location.href = hosted_url;
      } else {
        throw new Error('Could not retrieve checkout URL.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-labelledby="purchase-modal-title"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
          <CloseIcon />
        </button>
        <div className="flex items-start gap-4 mb-6">
          <img src={track.coverArt} alt={track.title} className="w-20 h-20 rounded-md object-cover" />
          <div>
            <h3 id="purchase-modal-title" className="text-2xl font-bold">{track.title}</h3>
            <p className="text-gray-400">{track.artist}</p>
            <p className="text-lg text-purple-400 font-mono mt-1">${track.price.toFixed(2)}</p>
          </div>
        </div>
        <div>
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full flex justify-center items-center gap-3 py-3 bg-gradient-to-r from-orange-500 to-black rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <SpinnerIcon className="h-5 w-5" />
                Processing...
              </>
            ) : (
              <>
                <CryptoIcon />
                Pay with Crypto
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
           <p className="text-xs text-gray-500 mt-4 text-center">Powered by Coinbase Commerce</p>
           <p className="text-xs text-gray-400 mt-2 text-center">Note: Crypto payments may take a few minutes to confirm on the blockchain.</p>
        </div>
      </div>
    </div>
  );
};
