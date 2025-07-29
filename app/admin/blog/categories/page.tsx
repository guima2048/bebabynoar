'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  createdAt: Date
  updatedAt: Date
}

interface CategoryForm {
  id?: string
  name: string
  description: string
  color: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    description: '',
    color: '#EC4899'
  })

  // Verificar se é admin
  useEffect(() => {
    if (loading) return
    
    // Remover qualquer import de next-auth/react e uso de useSession
    // if (!session?.user?.id || !session.user.isAdmin) {
    //   router.push('/admin/')
    // }
  }, [loading, router])

  // Buscar categorias
  useEffect(() => {
    // Remover qualquer import de next-auth/react e uso de useSession
    // if (session?.user?.isAdmin) {
      fetchCategories()
    // }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Nome é obrigatório')
      return
    }

    try {
      const url = editingCategory ? '/api/blog/categories' : '/api/blog/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory ? { ...formData, id: editingCategory.id } : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        alert(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!')
        resetForm()
        fetchCategories()
      } else {
        alert(data.error || 'Erro ao salvar categoria')
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return
    }

    try {
      const response = await fetch(`/api/blog/categories?id=${categoryId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        alert('Categoria deletada!')
        fetchCategories()
      } else {
        alert(data.error || 'Erro ao deletar categoria')
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      alert('Erro ao deletar categoria')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#EC4899'
    })
    setEditingCategory(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  // Remover qualquer import de next-auth/react e uso de useSession
  // if (!session?.user?.isAdmin) {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Categorias</h1>
              <p className="text-gray-600">Crie e gerencie categorias do blog</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Categories List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Categorias ({categories.length})</h2>
            </div>
            
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Nenhuma categoria criada ainda.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                >
                  Criar Primeira Categoria
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <div key={category.id} className="p-6 flex items-center justify-between focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Slug: {category.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da categoria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-gray-900 placeholder:text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none resize-none text-gray-900 placeholder:text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#EC4899"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none text-gray-900 placeholder:text-gray-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center justify-center gap-2 focus:ring-4 focus:ring-pink-400 focus:border-pink-600 focus:outline-none"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 