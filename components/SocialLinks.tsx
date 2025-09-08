
import React from 'react';
import type { SocialLink } from '../types';

interface SocialLinksProps {
  links: SocialLink[];
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ links }) => {
  return (
    <div className="flex justify-center items-center space-x-6">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
          className="text-gray-400 hover:text-white transition-colors duration-300"
        >
          <div className="w-8 h-8">
            {link.icon}
          </div>
        </a>
      ))}
    </div>
  );
};
