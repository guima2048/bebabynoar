'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { differenceInYears, parseISO } from 'date-fns'

const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
]

const schema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _').toLowerCase(),
  birthdate: z.string().refine((date) => {
    if (!date) { return false }
    const age = differenceInYears(new Date(), new Date(date))
    return age >= 18
  }, { message: 'Você deve ter pelo menos 18 anos' }),
  email: z.string().email('E-mail inválido'),
  emailConfirm: z.string(),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, '1 maiúscula').regex(/[a-z]/, '1 minúscula').regex(/[0-9]/, '1 número').regex(/[^A-Za-z0-9]/, '1 caractere especial'),
  state: z.string().refine((val) => estados.some(e => e.sigla === val), { message: 'Selecione um estado válido' }),
  city: z.string().min(2, 'Informe a cidade'),
  userType: z.enum(['sugar_baby', 'sugar_daddy'], { required_error: 'Selecione o tipo de usuário' }),
  terms: z.literal(true, { errorMap: () => ({ message: 'Você deve aceitar os termos' }) }),
}).refine((data) => data.email === data.emailConfirm, {
  message: 'Os e-mails não coincidem',
  path: ['emailConfirm'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [cidades, setCidades] = useState<string[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)
  const { register, handleSubmit, formState: { errors }, setError, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const router = useRouter()
  
  // Observa mudanças no campo estado
  const selectedState = watch('state')

  // Função para carregar cidades do estado selecionado
  const carregarCidades = async (siglaEstado: string) => {
    if (!siglaEstado) {
      setCidades([])
      setValue('city', '') // Reset do campo cidade
      return
    }

    setLoadingCidades(true)
    setValue('city', '') // Reset do campo cidade quando estado muda
    try {
      const estadoData = await import(`./data/${siglaEstado}.json`)
      setCidades(estadoData.cidades)
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
      setCidades([])
      toast.error('Erro ao carregar cidades do estado selecionado')
    } finally {
      setLoadingCidades(false)
    }
  }

  // Efeito para carregar cidades quando o estado muda
  useEffect(() => {
    if (selectedState) {
      carregarCidades(selectedState)
    } else {
      setCidades([])
      setValue('city', '')
    }
  }, [selectedState, setValue])

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      // Verifica unicidade do nome de usuário
      const q = query(collection(db, 'users'), where('username', '==', data.username))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setError('username', { message: 'Nome de usuário já existe' })
        setLoading(false)
        return
      }
      // Verifica unicidade do e-mail
      const q2 = query(collection(db, 'users'), where('email', '==', data.email))
      const snap2 = await getDocs(q2)
      if (!snap2.empty) {
        setError('email', { message: 'E-mail já cadastrado' })
        setLoading(false)
        return
      }
      // Cria usuário no Firebase Auth
      if (!auth) {
        toast.error('Serviço de autenticação indisponível. Tente novamente mais tarde.');
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth as any, data.email, data.password)
      const user = userCredential.user
      // Salva dados adicionais no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: data.username,
        birthdate: data.birthdate,
        email: data.email,
        state: data.state,
        city: data.city,
        userType: data.userType,
        createdAt: new Date().toISOString(),
        status: 'active',
        premium: false,
      })
      toast.success('Cadastro realizado com sucesso!')
      router.push('/profile/edit')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Criar Conta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nome de Usuário</label>
          <input type="text" className="input-field" {...register('username')} autoComplete="off" />
          {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Data de Nascimento</label>
          <input type="date" className="input-field" {...register('birthdate')} />
          {errors.birthdate && <span className="text-red-500 text-sm">{errors.birthdate.message}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">E-mail</label>
          <input type="email" className="input-field" {...register('email')} autoComplete="off" />
          {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirme o E-mail</label>
          <input type="email" className="input-field" {...register('emailConfirm')} autoComplete="off" />
          {errors.emailConfirm && <span className="text-red-500 text-sm">{errors.emailConfirm.message}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Senha</label>
          <input type="password" className="input-field" {...register('password')} autoComplete="new-password" />
          {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Estado</label>
            <select 
              className="input-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              {...register('state')}
            >
              <option value="">Selecione o estado</option>
              {estados.map((estado) => (
                <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
              ))}
            </select>
            {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Cidade</label>
            <select 
              className={`input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !selectedState || loadingCidades 
                  ? 'border-gray-200 bg-gray-50 text-gray-500' 
                  : 'border-gray-300'
              }`}
              {...register('city')} 
              disabled={!selectedState || loadingCidades}
            >
              <option value="">
                {loadingCidades ? 'Carregando...' : selectedState ? 'Selecione a cidade' : 'Selecione um estado primeiro'}
              </option>
              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>
            {errors.city && <span className="text-red-500 text-sm">{errors.city.message}</span>}
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Tipo de Usuário</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" value="sugar_baby" {...register('userType')} /> Sugar Baby
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" value="sugar_daddy" {...register('userType')} /> Sugar Daddy
            </label>
          </div>
          {errors.userType && <span className="text-red-500 text-sm">{errors.userType.message}</span>}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('terms')} />
          <span>
            Aceito os
            <Link href="/terms" className="underline ml-1" target="_blank">Termos de Uso</Link>
            e a
            <Link href="/privacy" className="underline ml-1" target="_blank">Política de Privacidade</Link>
          </span>
        </div>
        {errors.terms && <span className="text-red-500 text-sm">{errors.terms.message}</span>}
        <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
      <p className="text-center text-secondary-600 mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="underline text-primary-600">Entrar</Link>
      </p>
    </div>
  )
} 