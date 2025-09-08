import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { Track } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface MusicTrackProps {
  track: Track;
  onBuyClick: (track: Track) => void;
  isPlaying: boolean;
  onPlay: (trackId: string) => void;
  onPause: (trackId: string) => void;
}

const PREVIEW_DURATION = 30; // seconds
const FADE_OUT_START_TIME = 27; // seconds

export const MusicTrack = forwardRef<HTMLAudioElement, MusicTrackProps>(({ track, onBuyClick, isPlaying, onPlay, onPause }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;

    // Fade out logic
    if (currentTime >= FADE_OUT_START_TIME) {
        const fadeDuration = PREVIEW_DURATION - FADE_OUT_START_TIME;
        const timeIntoFade = currentTime - FADE_OUT_START_TIME;
        const volume = Math.max(0, 1 - (timeIntoFade / fadeDuration));
        audioRef.current.volume = volume;
    } else {
        // Ensure volume is 1 if we're before the fade time
        if (audioRef.current.volume !== 1) {
          audioRef.current.volume = 1;
        }
    }

    // Loop logic
    if (currentTime >= PREVIEW_DURATION) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1; // Reset volume on loop
        // The browser's default behavior will continue playing after setting currentTime, so no need to call play() again.
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.addEventListener('timeupdate', handleTimeUpdate);
        // Ensure volume is reset when starting to play
        if (audio.currentTime < FADE_OUT_START_TIME) {
          audio.volume = 1;
        }
      } else {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        // Optionally reset volume when paused, though it will be reset on play anyway.
        // audio.volume = 1; 
      }
    }

    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      onPause(track.id);
    } else {
      // Ensure we start from the beginning if the track ended or was stopped past the preview
      if (audio.currentTime >= PREVIEW_DURATION) {
        audio.currentTime = 0;
      }
      audio.play().catch(error => console.error("Error attempting to play audio:", error));
      onPlay(track.id);
    }
  };
  
  const handleAudioEnded = () => {
    // This will now only fire if the full audio source is less than 30s.
    onPause(track.id);
    if(audioRef.current) {
        audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/40 transition-all duration-300 gap-4">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <img src={track.coverArt} alt={track.title} className="w-16 h-16 rounded-md object-cover" />
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{track.title}</h3>
          <p className="text-gray-400 text-sm">{track.artist}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <audio 
          ref={audioRef} 
          src={track.audioSrc} 
          preload="metadata"
          onEnded={handleAudioEnded}
        ></audio>

        <button onClick={togglePlay} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label={isPlaying ? `Pausar ${track.title}` : `Tocar ${track.title}`}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        
        <button
          onClick={() => onBuyClick(track)}
          className="flex-grow sm:flex-grow-0 px-6 py-2 bg-gradient-to-r from-orange-500 to-black rounded-full font-semibold hover:opacity-90 transition-opacity duration-300"
        >
          Buy
        </button>
      </div>
    </div>
  );
});

MusicTrack.displayName = 'MusicTrack';
