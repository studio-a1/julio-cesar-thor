import React, { useState, useCallback, useEffect } from 'react';
import { SocialLinks } from './components/SocialLinks';
import { MusicTrack } from './components/MusicTrack';
import { PurchaseModal } from './components/PurchaseModal';
import { TRACKS, SOCIAL_LINKS, BACKGROUND_IMAGES } from './constants';
import type { Track } from './types';
import { SuccessPage } from './SuccessPage';
import { DownloadIcon } from './components/Icons';

const openseaURL = 'https://opensea.io/collection/cosmosonic';
const qrCodeAPIURL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(openseaURL)}`;

const MainContent = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const handlePlay = useCallback((trackId: string) => {
    setPlayingTrackId(trackId);
  }, []);

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

  const handleDownloadManual = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const link = event.currentTarget;
    const pdfUrl = link.href;
    const fileName = link.download;
    const span = link.querySelector('span');
    const originalText = span ? span.textContent : '';

    if (span) {
      span.textContent = 'Downloading...';
      link.style.pointerEvents = 'none'; // Disable link during download
    }

    try {
      const response = await fetch(pdfUrl);

      // A common SPA issue is the server returning index.html for any unknown path.
      // We check the content-type to ensure we're not downloading the HTML shell.
      const contentType = response.headers.get('Content-Type');
      if (!response.ok || (contentType && contentType.includes('text/html'))) {
        throw new Error('Failed to retrieve the PDF file. The server may have returned an incorrect document.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = url;
      tempLink.setAttribute('download', fileName);
      
      document.body.appendChild(tempLink);
      tempLink.click();

      // Cleanup
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      const userFriendlyError = `An error occurred while trying to download the file.\n\nThis can happen if the file is not in the correct location or if the filename is misspelled. Please double-check that the file "Manual_Compra_Crypto.pdf" exists inside the "public/media" folder. Note that filenames can be case-sensitive.`;
      alert(userFriendlyError);
    } finally {
      if (span) {
        span.textContent = originalText;
        link.style.pointerEvents = 'auto';
      }
    }
  };

  return (
    <>
      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="font-nakara-outline text-5xl sm:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-gray-900">
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
            <h2 className="font-nakara-rough text-3xl font-bold mb-6 text-center sm:text-left">Cosmosonic</h2>
            <div className="space-y-6">
              {TRACKS.map(track => (
                <MusicTrack
                  key={track.id}
                  track={track}
                  onBuyClick={handleBuyClick}
                  isPlaying={playingTrackId === track.id}
                  onPlay={handlePlay}
                  onPause={handlePause}
                />
              ))}
            </div>
          </section>

          <section className="mt-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">The Art of Cosmosonic</h2>
            <p className="text-gray-300 mb-8 text-center max-w-xl mx-auto">
              Visual art from the 2017 original release and the new relaunch.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <img
                src="/media/cosmosonic_art1.png"
                alt="Cosmosonic Relaunch Artwork 1"
                className="rounded-lg w-full h-auto object-cover border-2 border-white/10 shadow-lg"
              />
              <img
                src="/media/cosmosonic_art2.png"
                alt="Cosmosonic Relaunch Artwork 2"
                className="rounded-lg w-full h-auto object-cover border-2 border-white/10 shadow-lg"
              />
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

          <section className="mt-12 text-center">
            <a
              href="/media/Manual_Compra_Crypto.pdf"
              download="Manual_Compra_Crypto.pdf"
              onClick={handleDownloadManual}
              className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-colors duration-300 group"
            >
              <DownloadIcon />
              <span>Download Crypto Purchase Guide</span>
            </a>
          </section>

          <footer className="mt-16 text-center text-gray-500 text-sm pb-8">
            <p>&copy; {new Date().getFullYear()} Julio César THOR. All rights reserved.</p>
          </footer>
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
  const [bgImage, setBgImage] = useState<string>('');

  useEffect(() => {
    // Select a random background image on mount
    const randomImage = BACKGROUND_IMAGES[Math.floor(Math.random() * BACKGROUND_IMAGES.length)];
    setBgImage(randomImage);
  }, []);

  return (
    <div className="relative min-h-screen w-full font-sans text-white overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        {bgImage && (
          <img
            src={bgImage}
            alt="Cosmic background"
            className="w-full h-full object-cover animate-kenburns"
            key={bgImage}
          />
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>
      </div>
      
      {isSuccessPage ? <SuccessPage /> : <MainContent />}
    </div>
  );
}
