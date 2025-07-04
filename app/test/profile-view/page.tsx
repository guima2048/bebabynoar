'use client';
import React, { useState } from 'react';

const socialIcons = {
  Instagram: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="8" fill="#fff"/>
      <rect x="4" y="4" width="20" height="20" rx="6" fill="#E1306C"/>
      <circle cx="14" cy="14" r="5" stroke="#fff" strokeWidth="2"/>
      <circle cx="19.5" cy="8.5" r="1.5" fill="#fff"/>
    </svg>
  ),
  WhatsApp: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="8" fill="#fff"/>
      <rect x="4" y="4" width="20" height="20" rx="6" fill="#25D366"/>
      <path d="M14 8a6 6 0 0 1 5.2 8.9l.7 2.1-2.2-.7A6 6 0 1 1 14 8zm0-2a8 8 0 0 0-6.9 12.2l-1.1 3.3a1 1 0 0 0 1.3 1.3l3.3-1.1A8 8 0 1 0 14 6z" fill="#fff"/>
    </svg>
  ),
};

const mockProfile = {
  username: 'sugarqueen',
  age: 27,
  gender: 'Feminino',
  orientation: 'Heterossexual',
  city: 'Rio de Janeiro',
  state: 'RJ',
  country: 'Brasil',
  height: '1,68m',
  weight: '60-65kg',
  sign: 'Leão',
  education: 'Superior Completo',
  profession: 'Advogada',
  smokes: 'Não',
  drinks: 'Socialmente',
  hasChildren: 'Não',
  pets: 'Sim',
  religion: 'Católica',
  languages: ['Português', 'Inglês'],
  relationshipType: 'Ambos (online e presencial)',
  lookingFor: 'Sugar Daddy',
  availableForTravel: 'Sim',
  receiveTravelers: 'Depende',
  interests: ['Viagens', 'Gastronomia', 'Moda', 'Esportes'],
  isPremium: true,
  isVIP: false,
  profilePhoto: '/landing/baby-1.png',
  publicPhotos: [
    '/landing/baby-1.png',
    '/landing/baby-1.png',
    '/landing/baby-1.png',
  ],
  privatePhotos: [
    '/landing/baby-1.png',
    '/landing/baby-1.png',
  ],
  hasPrivatePhotos: true,
  socialLinks: ['Instagram', 'WhatsApp'],
  travelMode: {
    active: true,
    destination: 'Florianópolis',
    from: '2024-07-10',
    to: '2024-07-20',
    looking: 'Conhecer pessoas locais',
  },
  about: 'Sou aventureira, adoro viajar e conhecer pessoas novas. Busco experiências únicas e sinceras.',
  whatLookingFor: 'Procuro um relacionamento sugar maduro, com respeito e diversão. Gosto de viajar e de bons restaurantes.',
};

export default function TestProfileViewPage() {
  // Mistura fotos públicas e privadas no carrossel
  const photos = [
    ...(mockProfile.publicPhotos?.map(url => ({ url, isPrivate: false })) || []),
    ...(mockProfile.privatePhotos?.map(url => ({ url, isPrivate: true })) || []),
  ];
  const [photoIdx, setPhotoIdx] = useState(0);

  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % photos.length);
  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-0 px-0">
      {/* Carrossel de fotos grandes - formato 3x4 */}
      <div className="relative w-full max-w-md" style={{ aspectRatio: '3/4', maxHeight: 'calc(100vw * 4 / 3)', minHeight: 320 }}>
        <img
          src={photos[photoIdx].url}
          alt={`Foto ${photoIdx + 1}`}
          className={`w-full h-full object-cover object-center select-none ${photos[photoIdx].isPrivate ? 'filter blur-md grayscale' : ''}`}
          draggable={false}
        />
        {/* Overlay proibido e botão para fotos privadas */}
        {photos[photoIdx].isPrivate && (
          <>
            {/* Botão solicitar fotos privadas centralizado */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button className="pointer-events-auto bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition w-full max-w-xs opacity-95">
                Solicitar fotos privadas
              </button>
            </div>
          </>
        )}
        {photos.length > 1 && (
          <>
            <button
              className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-white/20 text-gray-400 rounded-full p-0 flex items-center justify-center"
              style={{ width: 24, height: 24, minWidth: 24, minHeight: 24, boxShadow: 'none' }}
              onClick={prevPhoto}
              aria-label="Foto anterior"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15L6 9L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-white/20 text-gray-400 rounded-full p-0 flex items-center justify-center"
              style={{ width: 24, height: 24, minWidth: 24, minHeight: 24, boxShadow: 'none' }}
              onClick={nextPhoto}
              aria-label="Próxima foto"
            >
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`inline-block w-2 h-2 rounded-full ${idx === photoIdx ? 'bg-pink-500' : 'bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
        {/* Overlay de identidade */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent px-4 py-3 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">@{mockProfile.username}</span>
            {mockProfile.isVIP && (
              <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">VIP</span>
            )}
            {!mockProfile.isVIP && mockProfile.isPremium && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full shadow">Premium</span>
            )}
            {mockProfile.travelMode?.active && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Modo Viagem</span>
            )}
          </div>
          <div className="text-white text-sm">
            {[mockProfile.age && `${mockProfile.age} anos`, mockProfile.gender, mockProfile.orientation].filter(Boolean).join(' • ')}
          </div>
          {(mockProfile.city || mockProfile.state || mockProfile.country) && (
            <div className="text-xs text-gray-200">
              {[mockProfile.city, mockProfile.state].filter(Boolean).join(', ')}{mockProfile.country ? ` - ${mockProfile.country}` : ''}
            </div>
          )}
        </div>
      </div>
      {/* Botões de ação */}
      <div className="flex gap-2 w-full max-w-md justify-center mt-3 mb-2 px-2">
        <button className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">Enviar mensagem</button>
        <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition">Denunciar</button>
      </div>
      {/* Redes sociais compactas */}
      {mockProfile.socialLinks && mockProfile.socialLinks.length > 0 && (
        <div className="flex gap-3 w-full max-w-md justify-center mb-2 px-2 flex-wrap">
          {mockProfile.socialLinks.map((rede) => {
            const icon = socialIcons[rede as keyof typeof socialIcons] || <span className="w-7 h-7 bg-gray-300 rounded-full" />;
            return (
              <div key={rede} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 shadow">
                <span>{icon}</span>
                <button className="text-xs bg-pink-600 text-white px-2 py-1 rounded font-semibold hover:bg-pink-700 transition">Solicitar</button>
              </div>
            );
          })}
        </div>
      )}
      {/* Cards de dados do perfil */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-2 px-2">
        {/* Sobre mim */}
        {mockProfile.about && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-pink-700 mb-1">Sobre mim</div>
            <div className="text-sm text-gray-700 break-words">{mockProfile.about}</div>
          </div>
        )}
        {/* O que busco */}
        {mockProfile.whatLookingFor && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-pink-700 mb-1">O que busco</div>
            <div className="text-sm text-gray-700 break-words">{mockProfile.whatLookingFor}</div>
          </div>
        )}
        {/* Estilo de vida */}
        {(mockProfile.education || mockProfile.smokes || mockProfile.drinks || mockProfile.hasChildren || mockProfile.height || mockProfile.weight) && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-pink-700 mb-1">Estilo de Vida</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              {mockProfile.education && <div><b>Escolaridade:</b> {mockProfile.education}</div>}
              {mockProfile.smokes && <div><b>Fuma?</b> {mockProfile.smokes}</div>}
              {mockProfile.drinks && <div><b>Bebe?</b> {mockProfile.drinks}</div>}
              {mockProfile.hasChildren && <div><b>Tem filhos?</b> {mockProfile.hasChildren}</div>}
              {mockProfile.height && <div><b>Altura:</b> {mockProfile.height}</div>}
              {mockProfile.weight && <div><b>Peso:</b> {mockProfile.weight}</div>}
            </div>
          </div>
        )}
        {/* Relacionamento sugar */}
        {(mockProfile.relationshipType || mockProfile.lookingFor || mockProfile.availableForTravel || mockProfile.receiveTravelers) && (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold text-pink-700 mb-1">Relacionamento Sugar</div>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
              {mockProfile.relationshipType && <div><b>Tipo de relacionamento:</b> {mockProfile.relationshipType}</div>}
              {mockProfile.lookingFor && <div><b>Busca:</b> {mockProfile.lookingFor}</div>}
              {mockProfile.availableForTravel && <div><b>Disponível para viagens?</b> {mockProfile.availableForTravel}</div>}
              {mockProfile.receiveTravelers && <div><b>Receber viajantes?</b> {mockProfile.receiveTravelers}</div>}
            </div>
          </div>
        )}
        {/* Modo viagem */}
        {mockProfile.travelMode?.active && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow p-4">
            <div className="font-semibold text-yellow-700 mb-1">Modo Viagem Ativo</div>
            {mockProfile.travelMode.destination && (
              <div className="text-xs text-gray-700">Destino: <b>{mockProfile.travelMode.destination}</b></div>
            )}
            {mockProfile.travelMode.from && mockProfile.travelMode.to && (
              <div className="text-xs text-gray-700">De: {mockProfile.travelMode.from} até {mockProfile.travelMode.to}</div>
            )}
            {mockProfile.travelMode.looking && (
              <div className="text-xs text-gray-700">Busca: {mockProfile.travelMode.looking}</div>
            )}
          </div>
        )}
      </div>
      {/* Espaço extra para mobile */}
      <div className="h-8" />
    </div>
  );
} 