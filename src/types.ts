export interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioSrc?: string; // Preview audio - now optional
  price: number; // For display purposes
  priceId: string; // Stripe Price ID
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactElement;
}
