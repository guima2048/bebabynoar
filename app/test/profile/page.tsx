'use client';
import React, { useState } from 'react';

const socialList = [
  { name: 'WhatsApp', placeholder: 'Seu número' },
  { name: 'Telegram', placeholder: 'Seu @username' },
  { name: 'Instagram', placeholder: 'Seu @username' },
  { name: 'Facebook', placeholder: 'Seu perfil ou link' },
  { name: 'X', placeholder: 'Seu @username' },
  { name: 'Snapchat', placeholder: 'Seu @username' },
  { name: 'TikTok', placeholder: 'Seu @username' },
  { name: 'LinkedIn', placeholder: 'Seu perfil ou link' },
  { name: 'OnlyFans', placeholder: 'Seu link' },
];

const initialProfile = {
  username: 'anaclara',
  age: 24,
  gender: 'Feminino',
  orientation: 'Heterossexual',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
  height: '1,65m',
  weight: '55-60kg',
  sign: 'Áries',
  education: 'Superior Completo',
  profession: 'Designer',
  smokes: 'Não',
  drinks: 'Socialmente',
  hasChildren: 'Não',
  pets: 'Sim',
  religion: 'Espírita',
  languages: ['Português', 'Espanhol'],
  relationshipType: 'Ambos (online e presencial)',
  lookingFor: 'Sugar Daddy',
  availableForTravel: 'Sim',
  receiveTravelers: 'Sim',
  interests: ['Viagens', 'Arte', 'Fotografia', 'Gastronomia'],
  isPremium: true,
  isVIP: false,
  publicPhotos: [
    '/landing/baby-1.png',
    '/landing/baby-1.png',
  ],
  privatePhotos: [
    '/landing/baby-1.png',
  ],
  about: 'Sou criativa, amo viajar e conhecer novas culturas. Busco novas experiências e amizades sinceras.',
  whatLookingFor: 'Quero um relacionamento sugar leve, divertido e com respeito. Adoro viajar e boa gastronomia.',
  travelMode: {
    active: true,
    destination: 'Salvador',
    from: '2024-08-01',
    to: '2024-08-10',
    looking: 'Procurando companhia para passeios',
  },
  social: {
    WhatsApp: '',
    Telegram: '',
    Instagram: '',
    Facebook: '',
    X: '',
    Snapchat: '',
    TikTok: '',
    LinkedIn: '',
    OnlyFans: '',
  },
};

export default function TestProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = [
    ...(profile.publicPhotos?.map(url => ({ url, isPrivate: false })) || []),
    ...(profile.privatePhotos?.map(url => ({ url, isPrivate: true })) || []),
  ];

  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % photos.length);
  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);

  // Função para atualizar redes sociais
  const handleSocialChange = (name: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      social: {
        ...prev.social,
        [name]: value,
      },
    }));
  };

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
        {photos[photoIdx].isPrivate && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <button className="pointer-events-auto bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition w-full max-w-xs opacity-95">
              Solicitar fotos privadas
            </button>
          </div>
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
            <span className="text-lg font-bold text-white">@{profile.username}</span>
            {profile.isVIP && (
              <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">VIP</span>
            )}
            {!profile.isVIP && profile.isPremium && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full shadow">Premium</span>
            )}
            {profile.travelMode?.active && (
              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full ml-2">Modo Viagem</span>
            )}
          </div>
          <div className="text-white text-sm">
            {[profile.age && `${profile.age} anos`, profile.gender, profile.orientation].filter(Boolean).join(' • ')}
          </div>
          {(profile.city || profile.state || profile.country) && (
            <div className="text-xs text-gray-200">
              {[profile.city, profile.state].filter(Boolean).join(', ')}{profile.country ? ` - ${profile.country}` : ''}
            </div>
          )}
        </div>
      </div>
      {/* Botões de ação */}
      <div className="flex gap-2 w-full max-w-md justify-center mt-3 mb-2 px-2">
        <button className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 transition">Salvar alterações</button>
        <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition">Visualizar perfil</button>
      </div>
      {/* Cards de dados do perfil (editáveis) */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-2 px-2">
        {/* Sobre mim */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-pink-700 mb-1">Sobre mim</div>
          <textarea
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
            rows={2}
            placeholder="Fale um pouco sobre você..."
            value={profile.about}
            onChange={e => setProfile(p => ({ ...p, about: e.target.value }))}
          />
        </div>
        {/* O que busco */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-pink-700 mb-1">O que busco</div>
          <textarea
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
            rows={2}
            placeholder="O que você procura em um relacionamento sugar?"
            value={profile.whatLookingFor}
            onChange={e => setProfile(p => ({ ...p, whatLookingFor: e.target.value }))}
          />
        </div>
        {/* Estilo de vida */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-pink-700 mb-1">Estilo de Vida</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex flex-col gap-1">
              <label htmlFor="education">Escolaridade</label>
              <input id="education" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.education} onChange={e => setProfile(p => ({ ...p, education: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="profession">Profissão</label>
              <input id="profession" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.profession} onChange={e => setProfile(p => ({ ...p, profession: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="smokes">Fuma?</label>
              <input id="smokes" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.smokes} onChange={e => setProfile(p => ({ ...p, smokes: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="drinks">Bebe?</label>
              <input id="drinks" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.drinks} onChange={e => setProfile(p => ({ ...p, drinks: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="hasChildren">Tem filhos?</label>
              <input id="hasChildren" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.hasChildren} onChange={e => setProfile(p => ({ ...p, hasChildren: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="height">Altura</label>
              <input id="height" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.height} onChange={e => setProfile(p => ({ ...p, height: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="weight">Peso</label>
              <input id="weight" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.weight} onChange={e => setProfile(p => ({ ...p, weight: e.target.value }))} />
            </div>
          </div>
        </div>
        {/* Relacionamento sugar */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold text-pink-700 mb-1">Relacionamento Sugar</div>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
            <div className="flex flex-col gap-1">
              <label htmlFor="relationshipType">Tipo de relacionamento</label>
              <input id="relationshipType" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.relationshipType} onChange={e => setProfile(p => ({ ...p, relationshipType: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="lookingFor">Busca</label>
              <input id="lookingFor" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.lookingFor} onChange={e => setProfile(p => ({ ...p, lookingFor: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="availableForTravel">Disponível para viagens?</label>
              <input id="availableForTravel" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.availableForTravel} onChange={e => setProfile(p => ({ ...p, availableForTravel: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="receiveTravelers">Receber viajantes?</label>
              <input id="receiveTravelers" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.receiveTravelers} onChange={e => setProfile(p => ({ ...p, receiveTravelers: e.target.value }))} />
            </div>
          </div>
        </div>
        {/* Modo viagem */}
        {profile.travelMode?.active && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow p-4">
            <div className="font-semibold text-yellow-700 mb-1">Modo Viagem Ativo</div>
            <div className="flex flex-col gap-1 text-xs text-gray-700">
              <div>
                <label htmlFor="travelMode-destination">Destino</label>
                <input id="travelMode-destination" className="border border-gray-200 rounded px-2 py-1 text-sm ml-2" value={profile.travelMode.destination} onChange={e => setProfile(p => ({ ...p, travelMode: { ...p.travelMode, destination: e.target.value } }))} />
              </div>
              <div>
                <label htmlFor="travelMode-from">De</label>
                <input id="travelMode-from" className="border border-gray-200 rounded px-2 py-1 text-sm ml-2" value={profile.travelMode.from} onChange={e => setProfile(p => ({ ...p, travelMode: { ...p.travelMode, from: e.target.value } }))} />
                <span className="mx-1">até</span>
                <input id="travelMode-to" className="border border-gray-200 rounded px-2 py-1 text-sm" value={profile.travelMode.to} onChange={e => setProfile(p => ({ ...p, travelMode: { ...p.travelMode, to: e.target.value } }))} />
              </div>
              <div>
                <label htmlFor="travelMode-looking">Busca</label>
                <input id="travelMode-looking" className="border border-gray-200 rounded px-2 py-1 text-sm ml-2" value={profile.travelMode.looking} onChange={e => setProfile(p => ({ ...p, travelMode: { ...p.travelMode, looking: e.target.value } }))} />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Campos de redes sociais */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-2 px-2">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-semibold text-pink-700">Redes Sociais</div>
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
              As redes sociais só serão mostradas após sua autorização. Quando alguém solicitar, você receberá um pedido e só após aprovar a pessoa terá acesso.
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {socialList.map(({ name, placeholder }) => (
              <div key={name} className="flex items-center gap-2">
                <label className="w-24 text-xs text-gray-600 font-semibold" htmlFor={`social-${name}`}>{name}:</label>
                <input
                  id={`social-${name}`}
                  type="text"
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                  placeholder={placeholder}
                  value={profile.social[name as keyof typeof profile.social] || ''}
                  onChange={e => handleSocialChange(name, e.target.value)}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Espaço extra para mobile */}
      <div className="h-8" />
    </div>
  );
} 