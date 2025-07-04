import React from 'react';

export default function BgTest3() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-700 relative">
      <svg className="absolute inset-0 w-full h-full opacity-20" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="4" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <div className="relative z-10 text-white text-3xl font-bold drop-shadow-xl">Fundo Gradiente + Bolinhas SVG</div>
    </div>
  );
} 