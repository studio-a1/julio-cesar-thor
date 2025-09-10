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
const FADE_IN_DURATION = 2;  // seconds
const FADE_OUT_DURATION = 3; // seconds
const FADE_OUT_START_TIME = PREVIEW_DURATION - FADE_OUT_DURATION;

export const MusicTrack = forwardRef<HTMLAudioElement, MusicTrackProps>(({ track, onBuyClick, isPlaying, onPlay, onPause }, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const { currentTime } = audio;

    // Stop playback when the preview duration is reached
    if (currentTime >= PREVIEW_DURATION) {
      audio.pause();
      onPause(track.id);
      return;
    }

    let newVolume = 1;
    // Fade in logic
    if (currentTime < FADE_IN_DURATION) {
      newVolume = currentTime / FADE_IN_DURATION;
    }
    // Fade out logic
    else if (currentTime > FADE_OUT_START_TIME) {
      const timeIntoFade = currentTime - FADE_OUT_START_TIME;
      newVolume = 1 - (timeIntoFade / FADE_OUT_DURATION);
    }
    
    // Clamp volume between 0 and 1 to prevent errors
    audio.volume = Math.max(0, Math.min(1, newVolume));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Attach or detach the timeupdate listener based on playback state
    if (isPlaying) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
    } else {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    }

    // Cleanup listener on component unmount
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      onPause(track.id);
    } else {
      // Per user request, any "play" action starts the preview from the beginning.
      audio.currentTime = 0;
      audio.volume = 0; // Start muted for the fade-in effect
      audio.play().catch(error => console.error("Error attempting to play audio:", error));
      onPlay(track.id);
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
        {track.audioSrc && (
          <>
            <audio 
              ref={audioRef} 
              src={track.audioSrc} 
              preload="metadata"
            ></audio>

            <button onClick={togglePlay} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label={isPlaying ? `Pausar ${track.title}` : `Tocar ${track.title}`}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </>
        )}
        
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
