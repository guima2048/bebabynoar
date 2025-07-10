"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function CreateAdminUserPage() {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação robusta
    const errors: string[] = []
    
    if (!name.trim()) errors.push("Nome é obrigatório")
    if (name.length < 2) errors.push("Nome deve ter pelo menos 2 caracteres")
    if (name.length > 50) errors.push("Nome deve ter no máximo 50 caracteres")
    
    if (!username.trim()) errors.push("Username é obrigatório")
    if (username.length < 3) errors.push("Username deve ter pelo menos 3 caracteres")
    if (username.length > 20) errors.push("Username deve ter no máximo 20 caracteres")
    if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.push("Username deve conter apenas letras, números e underscore")
    
    if (!email.trim()) errors.push("Email é obrigatório")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email inválido")
    if (email.length > 100) errors.push("Email muito longo")
    
    if (!password) errors.push("Senha é obrigatória")
    if (password.length < 8) errors.push("Senha deve ter pelo menos 8 caracteres")
    if (password.length > 100) errors.push("Senha muito longa")
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/create-admin-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Usuário admin criado com sucesso!")
        setName("")
        setUsername("")
        setEmail("")
        setPassword("")
        router.push("/admin/users")
      } else {
        toast.error(data.error || "Erro ao criar usuário admin")
      }
    } catch (err) {
      toast.error("Erro ao criar usuário admin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Novo Admin</h1>
        <p className="text-gray-600 mt-2">Adicione novos usuários administrativos ao sistema</p>
      </div>

      <div className="max-w-md bg-white rounded-lg shadow-sm border p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Criando..." : "Criar Admin"}
          </button>
        </form>
      </div>
    </div>
  )
} 