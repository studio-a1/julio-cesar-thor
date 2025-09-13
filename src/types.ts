export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioSrc?: string; // Preview audio - now optional
  price: number; // For display purposes
  priceId: string; // Kept for potential future integrations
  fileName: string; // The actual filename for the full track, e.g., '1_Orion.mp3'
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactElement;
}
