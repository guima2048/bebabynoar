import { Metadata } from 'next'
import BlogPostList from '@/components/BlogPostList'

export const metadata: Metadata = {
  title: 'Blog - Bebaby App',
  description: 'Descubra dicas, histórias e insights sobre relacionamentos sugar.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blog Bebaby
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              Descubra dicas, histórias e insights sobre relacionamentos sugar
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="px-4 py-2 bg-white/20 rounded-full">
                💕 Relacionamentos
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-full">
                💰 Finanças
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-full">
                ✈️ Viagens
              </span>
              <span className="px-4 py-2 bg-white/20 rounded-full">
                🎯 Dicas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Posts Recentes
          </h2>
          
          <BlogPostList />
          
          {/* Newsletter Signup */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Fique por dentro das novidades! 📧
            </h3>
            <p className="text-gray-600 mb-6">
              Receba as melhores dicas e histórias diretamente no seu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors duration-200">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 