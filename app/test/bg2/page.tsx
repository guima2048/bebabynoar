import React from 'react';

export default function BgTest2() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-fuchsia-900 to-pink-700" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-white text-3xl font-bold drop-shadow-xl">Fundo Gradiente + Overlay Escuro</div>
    </div>
  );
} 