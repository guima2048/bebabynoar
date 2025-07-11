import Link from 'next/link';

export default function BeneficiosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header simples */}
      <header className="w-full py-4 px-4 flex items-center justify-between border-b border-gray-100 bg-white">
        <span className="text-xl font-bold text-pink-600">Bebaby</span>
        <nav className="flex gap-4">
          <Link href="/explore" className="text-gray-700 font-medium">Explorar</Link>
          <Link href="/register" className="text-pink-600 font-semibold">Cadastre-se</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between text-center md:text-left px-4 md:px-16 py-10 bg-gradient-to-b from-pink-50 to-white gap-8 md:gap-16">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight md:leading-tight">Por que escolher o Bebaby?</h1>
          <h2 className="text-lg md:text-2xl text-pink-600 font-semibold mb-4">A plataforma sugar mais segura e exclusiva do Brasil</h2>
          <p className="text-gray-600 max-w-xl mb-6 md:mb-8">Descubra todos os benefícios de fazer parte da maior comunidade sugar do país. Segurança, discrição e experiências únicas para Sugar Babies e Sugar Daddies/Mommies.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link href="/register" className="bg-pink-600 text-white px-6 py-3 rounded-full font-semibold shadow hover:bg-pink-700 transition">Cadastre-se grátis</Link>
            <Link href="/explore" className="border-2 border-pink-600 text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-pink-50 transition">Explorar perfis</Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end">
          <div className="w-40 h-40 md:w-64 md:h-64 bg-pink-100 rounded-full flex items-center justify-center mb-4 md:mb-0">
            <span className="text-5xl md:text-7xl">💎</span>
          </div>
        </div>
      </section>

      {/* Benefícios em grid no desktop */}
      <section className="px-4 md:px-16 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Benefícios para Sugar Babies */}
          <div>
            <h3 className="text-2xl font-bold text-pink-500 mb-4">Para Sugar Babies</h3>
            <ul className="space-y-3 text-base md:text-lg">
              <li className="flex items-center gap-3"><span className="text-pink-400 text-xl">✔️</span> Segurança e privacidade total</li>
              <li className="flex items-center gap-3"><span className="text-pink-400 text-xl">✔️</span> Benefícios reais e experiências exclusivas</li>
              <li className="flex items-center gap-3"><span className="text-pink-400 text-xl">✔️</span> Perfis verificados e ambiente seguro</li>
              <li className="flex items-center gap-3"><span className="text-pink-400 text-xl">✔️</span> Networking com pessoas de alto padrão</li>
            </ul>
          </div>
          {/* Benefícios para Sugar Daddies/Mommies */}
          <div>
            <h3 className="text-2xl font-bold text-pink-700 mb-4">Para Sugar Daddies/Mommies</h3>
            <ul className="space-y-3 text-base md:text-lg">
              <li className="flex items-center gap-3"><span className="text-pink-600 text-xl">✔️</span> Discrição e anonimato garantidos</li>
              <li className="flex items-center gap-3"><span className="text-pink-600 text-xl">✔️</span> Perfis de alta qualidade e verificados</li>
              <li className="flex items-center gap-3"><span className="text-pink-600 text-xl">✔️</span> Facilidade para encontrar matches reais</li>
              <li className="flex items-center gap-3"><span className="text-pink-600 text-xl">✔️</span> Suporte dedicado e ambiente seguro</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 md:px-16 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">Como funciona</h3>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-pink-500 text-3xl mb-2">1</span>
            <p className="font-semibold">Cadastre-se gratuitamente</p>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-pink-500 text-3xl mb-2">2</span>
            <p className="font-semibold">Complete seu perfil</p>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-pink-500 text-3xl mb-2">3</span>
            <p className="font-semibold">Explore e conecte-se</p>
          </div>
          <div className="flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <span className="text-pink-500 text-3xl mb-2">4</span>
            <p className="font-semibold">Aproveite experiências únicas</p>
          </div>
        </div>
      </section>

      {/* Footer simples */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm bg-white border-t">© {new Date().getFullYear()} Bebaby. Todos os direitos reservados.</footer>
    </div>
  );
} 