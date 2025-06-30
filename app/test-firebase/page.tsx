'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore'

export default function TestFirebasePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  const testFirebase = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Testando Firebase...')
      
      // Teste 1: Verificar configuração
      const config = {
        projectId: db.app.options.projectId,
        authDomain: db.app.options.authDomain
      }
      console.log('Firebase config:', config)

      // Teste 2: Tentar ler dados
      const q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      console.log('Leitura bem-sucedida, documentos encontrados:', snapshot.docs.length)

      // Teste 3: Tentar escrever dados
      const testData = {
        title: 'Teste de Conexão Vercel',
        content: 'Este é um teste para verificar se o Firebase está funcionando no Vercel',
        status: 'draft',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      console.log('Tentando escrever dados de teste...')
      const docRef = await addDoc(collection(db, 'blog'), testData)
      console.log('Escrita bem-sucedida, ID:', docRef.id)

      setResult({
        success: true,
        message: 'Firebase está funcionando corretamente no Vercel!',
        config,
        readCount: snapshot.docs.length,
        writeId: docRef.id
      })

    } catch (err: any) {
      console.error('Erro no teste do Firebase:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const listarPostsBlog = async () => {
    setLoading(true)
    setError(null)
    setPosts([])
    try {
      const q = query(collection(db, 'blog'));
      const snapshot = await getDocs(q);
      const postsList = snapshot.docs.map(doc => ({
        id: doc.id,
        slug: doc.data().slug,
        status: doc.data().status,
        publishedAt: doc.data().publishedAt,
        title: doc.data().title,
      }));
      setPosts(postsList);
    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao listar posts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Teste do Firebase no Vercel</h1>
      
      <button
        onClick={testFirebase}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mr-2"
      >
        {loading ? 'Testando...' : 'Testar Firebase'}
      </button>
      <button
        onClick={listarPostsBlog}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Listando...' : 'Listar Posts do Blog'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Sucesso!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {posts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Posts do Blog</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">ID</th>
                  <th className="px-4 py-2 border">Slug</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">PublishedAt</th>
                  <th className="px-4 py-2 border">Title</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td className="px-4 py-2 border text-xs">{post.id}</td>
                    <td className="px-4 py-2 border text-xs">{post.slug}</td>
                    <td className="px-4 py-2 border text-xs">{post.status}</td>
                    <td className="px-4 py-2 border text-xs">{JSON.stringify(post.publishedAt)}</td>
                    <td className="px-4 py-2 border text-xs">{post.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instruções:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Clique no botão &quot;Testar Firebase&quot;</li>
          <li>Verifique se aparece &quot;Sucesso!&quot;</li>
          <li>Se aparecer erro, verifique as variáveis de ambiente no Vercel</li>
          <li>Abra o console do navegador para ver logs detalhados</li>
        </ol>
      </div>
    </div>
  )
} 