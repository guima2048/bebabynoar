import React from 'react'
import Link from 'next/link'
import { Heart, Shield, Users, Star, Award, Globe, Target, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Sobre o BeBaby</h1>
      <p className="text-gray-700">Esta página está em construção. Em breve você encontrará aqui informações sobre o projeto, missão, equipe e muito mais!</p>
    </div>
  )
}

export const metadata = {
  title: 'Sobre Nós - Bebaby App',
  description: 'Conheça a história, missão e valores do Bebaby App. A plataforma mais segura para relacionamentos sugar no Brasil.',
} 