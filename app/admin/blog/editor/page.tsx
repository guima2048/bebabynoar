'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import BlogImageUpload from '@/components/BlogImageUpload'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [featuredImageAlt, setFeaturedImageAlt] = useState('')
  const [status, setStatus] = useState('DRAFT')
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false);

  // Verificar autenticação
  useEffect(() => {
    checkAuth()
  }, [])

  // Buscar post para edição se houver id
  useEffect(() => {
    if (postId && typeof postId === 'string' && postId.length >= 5) {
      setLoadingPost(true);
      fetch(`/api/blog/posts/${postId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.post) {
            setTitle(data.post.title || '');
            setContent(data.post.content || '');
            setExcerpt(data.post.excerpt || '');
            setFeaturedImage(data.post.featuredImage || '');
            setFeaturedImageAlt(data.post.featuredImageAlt || '');
            setStatus(data.post.status || 'DRAFT');
          } else {
            toast.error('Post não encontrado para edição');
            router.push('/admin/blog');
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar post:', err);
          toast.error('Erro ao carregar post para edição');
          router.push('/admin/blog');
        })
        .finally(() => setLoadingPost(false));
    } else if (postId) {
      toast.error('ID de post inválido para edição');
      router.push('/admin/blog');
    }
  }, [postId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth')
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          window.location.href = '/admin/?redirect=/admin/blog/editor'
        }
      } else {
        window.location.href = '/admin/?redirect=/admin/blog/editor'
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      window.location.href = '/admin/?redirect=/admin/blog/editor'
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Título e conteúdo são obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = postId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.substring(0, 200) + '...',
          featuredImage,
          featuredImageAlt,
          status,
          categoryIds: [] // Por enquanto sem categorias
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post salvo com sucesso!')
        // Limpar formulário
        setTitle('')
        setContent('')
        setExcerpt('')
        setFeaturedImage('')
        setFeaturedImageAlt('')
        setStatus('DRAFT')
      } else {
        if (data.error && data.error.includes('título')) {
          toast.error('Já existe um post com este título! Escolha outro.');
        } else {
          toast.error(data.error || 'Erro ao salvar o post')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar o post')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Título e conteúdo são obrigatórios')
      return
    }

    setIsLoading(true)

    try {
      const url = postId ? `/api/blog/posts/${postId}` : '/api/blog/posts';
      const method = postId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.substring(0, 200) + '...',
          featuredImage,
          featuredImageAlt,
          status: 'PUBLISHED',
          categoryIds: [] // Por enquanto sem categorias
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Post publicado com sucesso!')
        // Limpar formulário
        setTitle('')
        setContent('')
        setExcerpt('')
        setFeaturedImage('')
        setFeaturedImageAlt('')
        setStatus('DRAFT')
      } else {
        if (data.error && data.error.includes('título')) {
          toast.error('Já existe um post com este título! Escolha outro.');
        } else {
          toast.error(data.error || 'Erro ao publicar o post')
        }
      }
    } catch (error) {
      console.error('Erro ao publicar:', error)
      toast.error('Erro ao publicar o post')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado como administrador.</p>
          <Link
            href="/admin/?redirect=/admin/blog/editor"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando post para edição...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/blog"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Editor de Posts</h1>
                <p className="text-sm text-gray-600">Crie e edite posts do blog</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {isLoading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Post *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do post..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Featured Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Destaque
              </label>
              <BlogImageUpload
                onImageUpload={setFeaturedImage}
                currentImage={featuredImage}
              />
              <input
                type="text"
                value={featuredImageAlt}
                onChange={e => setFeaturedImageAlt(e.target.value)}
                placeholder="Texto alternativo da imagem (acessibilidade e SEO)"
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Excerpt */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumo (Excerpt)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Digite um resumo do post (opcional)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se não preenchido, será gerado automaticamente a partir do conteúdo
              </p>
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="DRAFT">📝 Rascunho</option>
                <option value="PUBLISHED">✅ Publicado</option>
              </select>
            </div>

            {/* Content */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo do post..."
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {/* Preview */}
            {content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévia</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{title || 'Título do Post'}</h2>
                  {excerpt && (
                    <p className="text-gray-600 mb-4 italic">&ldquo;{excerpt}&rdquo;</p>
                  )}
                  <div className="prose max-w-none">
                    {content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph || '\u00A0'}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {content.length} caracteres
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  {isLoading ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 