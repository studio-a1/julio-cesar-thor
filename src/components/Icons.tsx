import React from 'react';

// Social Icons
export const InstagramIcon: React.FC = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <title>Instagram</title>
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.765.297 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.297-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.314 1.64 20.644 1.227 19.86.92c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.056 1.17-.249 1.805-.413 2.227-.217.562-.477.96-.896 1.382-.42.419-.82.679-1.382.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.585-.015-4.85-.074c-1.17-.056-1.805-.249-2.227-.413-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.82-1.381-.896-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.585.07-4.85c.055-1.17.249-1.805.413-2.227.217-.562.477.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057.36 2.227-.413C8.415 2.175 8.793 2.16 12 2.16zm0 9.09c-2.408 0-4.357-1.949-4.357-4.357s1.949-4.357 4.357-4.357 4.357 1.949 4.357 4.357-1.949 4.357-4.357 4.357zm0-7.014c-1.48 0-2.678 1.199-2.678 2.678s1.199 2.678 2.678 2.678 2.678-1.199 2.678-2.678-1.199-2.678-2.678-2.678zm6.502-2.184c-.53 0-.96.43-.96.96s.43.96.96.96.96-.43.96-.96-.43-.96-.96-.96z" />
  </svg>
);

export const FacebookIcon: React.FC = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <title>Facebook</title>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

export const YoutubeIcon: React.FC = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <title>YouTube</title>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );

// UI Icons
export const PlayIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
);

export const PauseIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 3.5A1.5 1.5 0 017 5v10a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5zm8 0A1.5 1.5 0 0115 5v10a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5z" />
    </svg>
);

export const AudioUnavailableIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className ?? 'h-6 w-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Audio Unavailable</title>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l-4-4m0 4l4-4"></path>
  </svg>
);

export const CloseIcon: React.FC = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const DownloadIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const CheckCircleIcon: React.FC = () => (
  <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// FIX: Accept a className prop to allow for custom styling and fix type error.
export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`animate-spin text-purple-400 ${className ?? 'h-16 w-16'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


// Blockchain Icons
export const BitcoinIcon: React.FC = () => (
  <svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Bitcoin</title>
    <path d="M11.333 24c6.248 0 11.333-5.085 11.333-11.333C22.666 6.42 19.34 2.24 14.82 0l-1.002 4.145c2.472.932 4.22 3.25 4.22 5.922 0 3.528-2.872 6.4-6.4 6.4-1.218 0-2.35-.342-3.302-.932L7.334 19.72c1.23.82 2.688 1.298 4 1.298zm-1.1-12.876V6.98H8.4v4.244c0 1.02.832 1.852 1.852 1.852h.98v4.244c0 1.02.832 1.852 1.852 1.852h.98V6.98h-3.98v4.244zm-9.05-1.9L0 12.673c0 6.248 5.085 11.333 11.333 11.333 1.31 0 2.583-.223 3.777-.638L11.01 19.22c-2.472-.932-4.22-3.25-4.22-5.922 0-3.528 2.872-6.4 6.4-6.4 1.218 0 2.35.342 3.302.932l1.002-4.145C16.28.82 13.822.342 12.588.342c-6.248 0-11.333 5.085-11.333 11.333z"/>
  </svg>
);

export const EthereumIcon: React.FC = () => (
  <svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Ethereum</title>
    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.365-10.38-7.364 4.35zM12.056 0L4.69 12.223l7.366 4.354 7.364-4.354L12.056 0z"/>
  </svg>
);

export const SolanaIcon: React.FC = () => (
  <svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Solana</title>
    <path d="M4.222 5.333A.667.667 0 0 0 3.555 6v3.111c0 .368.298.667.667.667h1.778a.667.667 0 0 0 .667-.667V6a.667.667 0 0 0-.667-.667H4.222zm0 8.889a.667.667 0 0 0-.667.667v3.111c0 .368.298.667.667.667h1.778a.667.667 0 0 0 .667-.667v-3.11a.667.667 0 0 0-.667-.667H4.222zm8.889-10.667a.667.667 0 0 0-.667.667v3.111c0 .368.298.667.667.667h1.778a.667.667 0 0 0 .667-.667V4.222a.667.667 0 0 0-.667-.667h-1.778zm0 8.889a.667.667 0 0 0-.667.667v3.111c0 .368.298.667.667.667h1.778a.667.667 0 0 0 .667-.667v-3.11a.667.667 0 0 0-.667-.667h-1.778zm8.889-7.111a.667.667 0 0 0-.667.667v3.111c0 .368.298.667.667.667H24a.667.667 0 0 0 .667-.667v-3.11a.667.667 0 0 0-.667-.667h-1.778z"/>
  </svg>
);

export const TronIcon: React.FC = () => (
  <svg fill="currentColor" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>TRON</title>
    <path d="M22.585 1.763L11.53.077a1.18 1.18 0 00-.974.002L.416 5.86a.6.6 0 00-.34.545l.001 10.613a.6.6 0 00.37.553l10.37 5.25a1.18 1.18 0 001.076 0l11.28-5.617a.6.6 0 00.376-.543l.001-14.41a.6.6 0 00-.565-.59zm-9.52 17.954l-5.62-2.822-2.52-1.264.001-5.11 3.255-1.63 4.885-2.45.002 13.277zm.998 1.28L3.25 15.688l-.001-4.72 8.783 4.394.015 3.633zm.001-5.61l-5.46-2.73 5.46-2.732 5.46 2.732-5.46 2.73zm.01-4.42L5.27 7.15l6.78-3.4 6.784 3.4-6.793 3.82zM12.062 2.3l8.799 4.4L12.06 11.1v-8.8zm.998 15.655l4.88-2.45 3.25-1.63.003 5.1-2.51 1.26-5.623 2.82V17.95z"/>
  </svg>
);
