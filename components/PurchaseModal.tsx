
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
