import React from 'react';

const mockUser = {
  name: 'Ana Clara',
  username: 'anaclara',
  age: 24,
  city: 'São Paulo',
  state: 'SP',
  photoURL: '/landing/baby-1.png',
  isPremium: true,
  isVIP: false,
  profileCompletion: 80,
  stats: {
    views: 123,
    likes: 45,
    privatePhotoRequests: 3,
  },
  publicPhotos: [
    '/landing/baby-1.png',
    '/landing/baby-1.png',
    '/landing/baby-1.png',
  ],
  privatePhotos: [
    '/landing/baby-1.png',
    '/landing/baby-1.png',
  ],
};

export default function TestProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-4 px-2">
      {/* Foto de perfil grande */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-pink-200 mb-3">
        <img src={mockUser.photoURL} alt="Foto de perfil" className="w-full h-full object-cover" />
        {mockUser.isVIP && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">VIP</span>
        )}
        {!mockUser.isVIP && mockUser.isPremium && (
          <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full shadow">Premium</span>
        )}
      </div>
      {/* Nome e localização */}
      <div className="text-center mb-2">
        <div className="text-xl font-bold text-gray-900">{mockUser.name}</div>
        <div className="text-sm text-gray-500">@{mockUser.username} • {mockUser.age} anos</div>
        <div className="text-xs text-gray-400">{mockUser.city}, {mockUser.state}</div>
      </div>
      {/* Barra de progresso do perfil */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Perfil {mockUser.profileCompletion}%</span>
          <span>{mockUser.profileCompletion < 100 ? 'Complete seu perfil' : 'Completo!'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${mockUser.profileCompletion}%` }}
          />
        </div>
      </div>
      {/* Botões de ação */}
      <div className="flex gap-2 mb-4 w-full max-w-xs justify-center">
        <button className="bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">Editar Perfil</button>
        <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-200 transition">Quem viu?</button>
        <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-yellow-200 transition">Modo Viagem</button>
      </div>
      {/* Estatísticas */}
      <div className="flex gap-4 mb-4 w-full max-w-xs justify-center">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-pink-600">{mockUser.stats.views}</span>
          <span className="text-xs text-gray-500">Visualizações</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-pink-600">{mockUser.stats.likes}</span>
          <span className="text-xs text-gray-500">Curtidas</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-pink-600">{mockUser.stats.privatePhotoRequests}</span>
          <span className="text-xs text-gray-500">Pedidos de fotos</span>
        </div>
      </div>
      {/* Galeria de fotos públicas */}
      <div className="w-full max-w-xs mb-4">
        <div className="font-semibold text-gray-700 mb-2">Fotos Públicas</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mockUser.publicPhotos.map((url, idx) => (
            <img key={idx} src={url} alt="Foto pública" className="w-20 h-20 object-cover rounded-lg border shadow" />
          ))}
        </div>
      </div>
      {/* Galeria de fotos privadas */}
      <div className="w-full max-w-xs mb-4">
        <div className="font-semibold text-gray-700 mb-2">Fotos Privadas</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mockUser.privatePhotos.map((url, idx) => (
            <img key={idx} src={url} alt="Foto privada" className="w-20 h-20 object-cover rounded-lg border shadow" />
          ))}
        </div>
      </div>
      {/* Sobre e interesses (mock) */}
      <div className="w-full max-w-xs mb-4">
        <div className="font-semibold text-gray-700 mb-1">Sobre mim</div>
        <div className="text-sm text-gray-600 mb-2">Sou uma pessoa divertida, adoro viajar e conhecer pessoas novas. Busco novas experiências e amizades sinceras.</div>
      </div>
      {/* Espaço extra para mobile */}
      <div className="h-8" />
    </div>
  );
} 