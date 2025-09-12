
export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioSrc: string; // Preview audio
  fullAudioSrc: string; // Full track for download
  price: number;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactElement;
}

export interface Blockchain {
  name: string;
  icon: React.ReactElement;
  symbol: string;
}

export enum ModalStep {
  Connect,
  SelectChain,
  Processing,
  Success
}
