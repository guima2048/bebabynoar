"use client";
import React, { useState, isValidElement, cloneElement } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export interface SidebarMenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

export interface SidebarMenuGroup {
  name: string;
  icon: React.ElementType;
  items: SidebarMenuItem[];
}

interface SidebarMenuProps {
  menuGroups?: SidebarMenuGroup[];
}

export default function SidebarMenu({ menuGroups = [] }: SidebarMenuProps) {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const handleClick = async (item: SidebarMenuItem) => {
    if (item.href === "__logout__") {
      await logout();
      window.location.href = "/";
    }
  };

  // Unifica todos os itens de todos os grupos em um único array
  const allItems = menuGroups.flatMap(group => (group.items ?? []));

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {/* Botão principal (sino) */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        aria-label="Abrir menu"
      >
        <Bell size={18} />
      </button>
      {/* Menu lateral simplificado: apenas ícones em bolas */}
      <div style={{
        position: 'relative',
        width: open ? 45 : 0,
        minHeight: open ? allItems.length * 45 : 0,
        background: 'transparent',
        borderRadius: 0,
        boxShadow: 'none',
        marginTop: 12,
        overflow: 'visible',
        transition: 'width 0.3s, minHeight 0.3s, background 0.3s',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        zIndex: 999,
        padding: open ? 4 : 0,
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center',
      }}>
        {open && allItems.map((item, idx) => (
          <a
            key={item.href}
            href={item.href.startsWith("/") ? item.href : undefined}
            aria-label={item.label}
            title={item.label}
            onClick={e => {
              if (item.href === "__logout__") {
                e.preventDefault();
                handleClick(item);
              }
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f3f3f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: item.color || '#222',
              fontWeight: 500,
              fontSize: 12,
              textDecoration: 'none',
              transition: 'background 0.2s',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: 0,
              border: 'none',
            }}
          >
            {/* Reduz o tamanho do ícone em 20% */}
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
} 