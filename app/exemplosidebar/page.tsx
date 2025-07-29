"use client";
import React from 'react';

// Ícones SVG simples (pode trocar por Heroicons/Lucide depois)
const ProfileIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>
);
const RequestsIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
);
const ViewedMeIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/></svg>
);
const MessageIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
const NotificationIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
const PremiumIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>
);
const ExploreIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-4.24 8.48-4.24-8.48 8.48 0z"/></svg>
);
const SearchIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const LogoutIcon = () => (
  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

const Badge = ({ count }: { count: number }) => (
  count > 0 ? (
    <span style={{
      position: 'absolute',
      top: -2,
      right: -2,
      background: 'red',
      color: 'white',
      borderRadius: '9999px',
      fontSize: 12,
      padding: '2px 6px',
      minWidth: 18,
      textAlign: 'center',
      zIndex: 2,
      lineHeight: 1,
    }}>{count}</span>
  ) : null
);

export default function ExemploSidebarPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7', padding: 0 }}>
      {/* Lista de ícones no topo direito */}
      <nav
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '16px 8px',
          zIndex: 1000,
          alignItems: 'center',
        }}
        aria-label="Menu rápido"
      >
        <a href="/profile" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Perfil">
          <ProfileIcon />
        </a>
        <a href="/profile/requests" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Solicitações de acesso ao perfil">
          <RequestsIcon />
        </a>
        <a href="/profile/who-viewed-me" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Quem viu meu perfil">
          <ViewedMeIcon />
        </a>
        <a href="/messages" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Mensagens">
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <MessageIcon />
            <Badge count={2} />
          </span>
        </a>
        <a href="/notifications" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Notificações">
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <NotificationIcon />
            <Badge count={5} />
          </span>
        </a>
        <a href="/premium" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Premium">
          <PremiumIcon />
        </a>
        <a href="/explore" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Explorar">
          <ExploreIcon />
        </a>
        <a href="/search" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#222', margin: 0 }} aria-label="Buscar">
          <SearchIcon />
        </a>
        <a href="/logout" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: '#c00', margin: 0 }} aria-label="Sair">
          <LogoutIcon />
        </a>
      </nav>
      {/* Conteúdo de exemplo */}
      <div style={{ paddingTop: 80, textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Exemplo de Menu Ícones em Lista Vertical</h1>
        <p>Só os vetores, um embaixo do outro, focado em mobile first.</p>
      </div>
    </div>
  );
} 