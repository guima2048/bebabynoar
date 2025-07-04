import React from 'react';
import Link from 'next/link';

interface UpsellPremiumProps {
  feature: string;
  requiredPlan?: 'free' | 'premium' | 'vip';
}

const planLabel = {
  free: 'Gratuito',
  premium: 'Premium',
  vip: 'VIP',
};

export default function UpsellPremium({ feature, requiredPlan }: UpsellPremiumProps) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🔒</div>
      <p className="text-lg font-semibold mb-2">Função exclusiva para {planLabel[requiredPlan || 'premium']}!</p>
      <p className="text-gray-600 mb-4">
        Torne-se {planLabel[requiredPlan || 'premium']} para acessar: <b>{feature}</b>.
      </p>
      <Link href="/premium" className="btn-primary inline-block">
        Ver planos
      </Link>
    </div>
  );
} 