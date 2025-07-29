"use client";
import SidebarMenu from "./SidebarMenu";
import { User, MessageCircle, Bell, LogOut, Eye, Users, Heart, Star, Compass, Search, Settings, Crown } from "lucide-react";

export default function SidebarMenuWrapper() {
  const menuGroups = [
    {
      name: "Perfil",
      icon: User,
      items: [
        { href: "/profile", icon: <User size={16} />, label: "Perfil" },
        { href: "/profile/requests", icon: <Users size={16} />, label: "Solicitações" },
        { href: "/profile/who-viewed-me", icon: <Eye size={16} />, label: "Quem viu meu perfil" },
        { href: "/profile/favorites", icon: <Heart size={16} />, label: "Meus Favoritos" },
        { href: "/profile/favorited-by", icon: <Star size={16} />, label: "Quem me favoritou" },
      ]
    },
    {
      name: "Social",
      icon: MessageCircle,
      items: [
        { href: "/messages", icon: <MessageCircle size={16} />, label: "Mensagens" },
      ]
    },
    {
      name: "Explorar",
      icon: Compass,
      items: [
        { href: "/explore", icon: <Compass size={16} />, label: "Explorar" },
        { href: "/search", icon: <Search size={16} />, label: "Buscar" },
      ]
    },
    {
      name: "Conta",
      icon: Settings,
      items: [
        { href: "/premium", icon: <Crown size={16} />, label: "Premium" },
        { href: "__logout__", icon: <LogOut size={16} />, label: "Sair", color: "#c00" },
      ]
    },
  ];
  return <SidebarMenu menuGroups={menuGroups} />;
} 