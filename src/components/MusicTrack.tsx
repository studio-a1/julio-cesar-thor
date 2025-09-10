import React, { useRef, useEffect } from 'react';
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

export const MusicTrack: React.FC<MusicTrackProps> = ({ track, onBuyClick, isPlaying, onPlay, onPause }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const togglePlay = () => {
    if (isPlaying) {
      onPause(track.id);
    } else {
      // .play() must be called in a user event handler for browser autoplay policies.
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.volume = 0; // Start muted for fade-in.
        // The play promise can be ignored here as the useEffect will handle the state.
        audio.play().catch(error => console.error("Audio playback failed:", error));
      }
      onPlay(track.id);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    
    // Always clean up the animation frame from the previous render.
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    if (!audio) return;

    if (isPlaying) {
      // The .play() call is in togglePlay. This effect manages the volume animation.
      const runAnimation = () => {
        // The check for `audioRef.current.paused` was removed as it caused a race condition.
        // The play() command is async. The animation frame could fire before the audio element's `paused`
        // property was updated to `false`, causing the animation to terminate prematurely.
        // The useEffect's cleanup function (which runs when `isPlaying` becomes false)
        // is now the sole mechanism for stopping the animation loop.
        if (!audioRef.current) {
          return; // Stop animation if audio element is unmounted.
        }

        const { currentTime } = audioRef.current;

        if (currentTime >= PREVIEW_DURATION) {
          audioRef.current.pause(); // This will trigger the 'pause' event listener, which calls onPause.
          return;
        }

        let newVolume = 1.0;
        if (currentTime < FADE_IN_DURATION) {
          newVolume = currentTime / FADE_IN_DURATION;
        } else if (currentTime >= FADE_OUT_START_TIME) {
          const timeIntoFade = currentTime - FADE_OUT_START_TIME;
          newVolume = 1.0 - (timeIntoFade / FADE_OUT_DURATION);
        }
        
        audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
        
        animationFrameId.current = requestAnimationFrame(runAnimation);
      };
      animationFrameId.current = requestAnimationFrame(runAnimation);

    } else {
      // If the isPlaying prop is false, ensure the audio is paused.
      // This will also be triggered by the onPause call from the 'pause' event listener.
      audio.pause();
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  // Sync parent state if audio pauses for any reason (e.g., end of preview)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncPauseState = () => {
      if (isPlaying) {
        // If the audio pauses unexpectedly while it should be playing,
        // update the parent component's state to reflect this.
        onPause(track.id);
      }
    };
    
    audio.addEventListener('pause', syncPauseState);
    
    return () => {
      audio.removeEventListener('pause', syncPauseState);
    };
  }, [isPlaying, onPause, track.id]);

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
};
