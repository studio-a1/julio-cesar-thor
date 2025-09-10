import React, { useState, useRef, useCallback } from 'react';
import { SocialLinks } from './components/SocialLinks';
import { MusicTrack } from './components/MusicTrack';
import { PurchaseModal } from './components/PurchaseModal';
import { TRACKS, SOCIAL_LINKS } from './constants';
import type { Track } from './types';
import { SuccessPage } from './pages/SuccessPage';

const openseaURL = 'https://opensea.io/collection/cosmosonic';
const qrCodeAPIURL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(openseaURL)}`;

const MainContent = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRefs = useRef<{[key: string]: HTMLAudioElement}>({});

  const handlePlay = useCallback((trackId: string) => {
    if (playingTrackId && playingTrackId !== trackId) {
      audioRefs.current[playingTrackId]?.pause();
    }
    setPlayingTrackId(trackId);
  }, [playingTrackId]);

  const handlePause = useCallback((trackId: string) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    }
  }, [playingTrackId]);

  const handleBuyClick = (track: Track) => {
    setSelectedTrack(track);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
  };

  return (
    <>
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-gray-900">
              Julio César THOR
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Exploring the frontiers of sound and crypto.
            </p>
            <div className="mt-8">
              <SocialLinks links={SOCIAL_LINKS} />
            </div>
          </header>

          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-3xl font-bold mb-6 text-center sm:text-left">Cosmosonic</h2>
            <div className="space-y-6">
              {TRACKS.map(track => (
                <MusicTrack
                  key={track.id}
                  track={track}
                  onBuyClick={handleBuyClick}
                  isPlaying={playingTrackId === track.id}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  ref={el => { if (el) audioRefs.current[track.id] = el; }}
                />
              ))}
            </div>
          </section>

          <section className="mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">NFT Collection</h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              Own a piece of the Cosmosonic universe. Explore our exclusive digital collectibles on OpenSea.
            </p>
            <div className="flex flex-col items-center gap-6">
              <div className="p-2 bg-white rounded-lg shadow-lg">
                <img
                  src={qrCodeAPIURL}
                  alt="QR Code for Cosmosonic NFT collection on OpenSea"
                  className="w-40 h-40"
                />
              </div>
              <a
                href={openseaURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-black rounded-full font-semibold hover:opacity-90 transition-opacity duration-300"
              >
                View on OpenSea
              </a>
            </div>
          </section>
        </div>
      </main>

      {isModalOpen && selectedTrack && (
        <PurchaseModal
          track={selectedTrack}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default function App(): React.ReactElement {
  // Use a regex to robustly check for the success path, handling issues like '//success'
  const isSuccessPage = /^\/*success/.test(window.location.pathname);

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-x-hidden">
      {/* Background Video */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://picsum.photos/1920/1080?blur=5"
        >
          {/* Using a placeholder video */}
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-liquid-flowing-in-a-slow-motion-44129-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
      </div>
      
      {isSuccessPage ? <SuccessPage /> : <MainContent />}
    </div>
  );
}
