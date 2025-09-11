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
      const response = await fetch('/api/create-coinbase-charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          trackName: track.title, 
          trackId: track.id,
          price: track.price.toString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment charge.');
      }

      const { hosted_url, code } = await response.json();
      if (hosted_url) {
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


/*
import React, { useState, useEffect } from 'react';
import type { Track, Blockchain } from '../types';
import { ModalStep } from '../types';
import { BLOCKCHAINS } from '../constants';
import { CloseIcon, CheckCircleIcon, DownloadIcon, SpinnerIcon } from './Icons';

interface PurchaseModalProps {
  track: Track;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ track, onClose }) => {
  const [step, setStep] = useState<ModalStep>(ModalStep.Connect);
  const [selectedChain, setSelectedChain] = useState<Blockchain | null>(null);

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

  const handleConnect = () => {
    setStep(ModalStep.SelectChain);
  };

  const handleSelectChain = (chain: Blockchain) => {
    setSelectedChain(chain);
    setStep(ModalStep.Processing);
    setTimeout(() => {
      setStep(ModalStep.Success);
    }, 2500); // Simulate transaction time
  };

  const renderContent = () => {
    switch (step) {
      case ModalStep.Connect:
        return (
          <>
            <h3 className="text-2xl font-bold mb-2">Purchase Song</h3>
            <p className="text-gray-300 mb-6">Connect your wallet to purchase "{track.title}".</p>
            <button
              onClick={handleConnect}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-black rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          </>
        );
      case ModalStep.SelectChain:
        return (
          <>
            <h3 className="text-2xl font-bold mb-4">Select Payment Method</h3>
            <p className="text-gray-300 mb-6">Choose a blockchain to pay with.</p>
            <div className="grid grid-cols-2 gap-4">
              {BLOCKCHAINS.map(chain => (
                <button
                  key={chain.name}
                  onClick={() => handleSelectChain(chain)}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="w-8 h-8">{chain.icon}</span>
                  <span className="font-semibold">{chain.name}</span>
                </button>
              ))}
            </div>
          </>
        );
      case ModalStep.Processing:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <SpinnerIcon />
            <h3 className="text-2xl font-bold mt-4">Processing Transaction</h3>
            <p className="text-gray-300 mt-2">Please wait while we confirm your payment on the {selectedChain?.name} network.</p>
          </div>
        );
      case ModalStep.Success:
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircleIcon />
            <h3 className="text-2xl font-bold mt-4">Payment Successful!</h3>
            <p className="text-gray-300 mt-2">You can now download "{track.title}".</p>
            <a
              href={track.fullAudioSrc}
              download={`${track.artist} - ${track.title}.mp3`}
              className="mt-6 inline-flex items-center gap-2 w-full justify-center py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <DownloadIcon />
              Download
            </a>
          </div>
        );
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
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
        <div className="flex items-start gap-4 mb-6">
          <img src={track.coverArt} alt={track.title} className="w-20 h-20 rounded-md object-cover" />
          <div>
            <h4 className="text-xl font-bold">{track.title}</h4>
            <p className="text-gray-400">{track.artist}</p>
            {selectedChain && <p className="text-sm text-purple-400 font-mono mt-1">{track.price} {selectedChain.symbol}</p>}
          </div>
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
*/
