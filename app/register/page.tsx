'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

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
  userType: z.enum(['sugar_baby', 'sugar_daddy', 'sugar_mommy', 'sugar_babyboy'], { required_error: 'Selecione o tipo de usuário' }),
  lookingFor: z.enum(['male', 'female', 'both'], { required_error: 'Selecione quem você procura' }),
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
  const [signupIp, setSignupIp] = useState<string>('')
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
      const response = await fetch(`/cidades/${siglaEstado}.json`)
      if (!response.ok) throw new Error('Arquivo não encontrado')
      const estadoData = await response.json()
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

  useEffect(() => {
    // Captura o IP público do usuário
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setSignupIp(data.ip))
      .catch(() => setSignupIp(''));
  }, []);

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      console.log('Iniciando processo de cadastro...', { username: data.username, email: data.email })
      
      // Define o gênero automaticamente baseado no tipo de usuário
      const getGenderFromUserType = (userType: string): string => {
        switch (userType) {
          case 'sugar_baby':
          case 'sugar_mommy':
            return 'female'
          case 'sugar_daddy':
          case 'sugar_babyboy':
            return 'male'
          default:
            return 'female'
        }
      }
      
      const userData = {
        username: data.username,
        birthdate: data.birthdate,
        email: data.email,
        state: data.state,
        city: data.city,
        userType: data.userType,
        gender: getGenderFromUserType(data.userType), // Gênero definido automaticamente
        lookingFor: data.lookingFor,
        password: data.password
      }
      console.log('Dados do usuário:', userData)
      
      // Registrar via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        console.log('Dados salvos com sucesso')
        toast.success('Cadastro realizado com sucesso!')
        router.push('/profile/edit')
      } else {
        const errorData = await response.json()
        if (errorData.error === 'username_exists') {
          setError('username', { message: 'Nome de usuário já existe' })
        } else if (errorData.error === 'email_exists') {
          setError('email', { message: 'E-mail já cadastrado' })
        } else {
          toast.error(errorData.message || 'Erro ao cadastrar. Tente novamente.')
        }
      }
    } catch (err: any) {
      console.error('Erro durante o cadastro:', err)
      console.error('Código do erro:', err.code)
      console.error('Mensagem do erro:', err.message)
      
      if (err.code === 'permission-denied') {
        toast.error('Erro de permissão. Verifique se você está logado corretamente.')
      } else if (err.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está sendo usado por outra conta.')
      } else if (err.code === 'auth/weak-password') {
        toast.error('A senha é muito fraca. Use uma senha mais forte.')
      } else {
        toast.error(err.message || 'Erro ao cadastrar. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <img
          src="/landing/baby-1.png"
          alt="Banner Bebaby"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-pink-900/60" />
      </div>
      {/* Formulário centralizado */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 bg-white/30 rounded-2xl shadow-xl border border-yellow-300/60 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
          Criar Conta
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="username">Nome de Usuário</label>
            <input id="username" type="text" className="input-field" {...register('username')} autoComplete="off" />
            {errors.username && <span className="text-red-500 text-sm">{errors.username.message}</span>}
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="birthdate">Data de Nascimento</label>
            <input id="birthdate" type="date" className="input-field" {...register('birthdate')} />
            {errors.birthdate && <span className="text-red-500 text-sm">{errors.birthdate.message}</span>}
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">E-mail</label>
            <input id="email" type="email" className="input-field" {...register('email')} autoComplete="off" />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="emailConfirm">Confirme o E-mail</label>
            <input id="emailConfirm" type="email" className="input-field" {...register('emailConfirm')} autoComplete="off" />
            {errors.emailConfirm && <span className="text-red-500 text-sm">{errors.emailConfirm.message}</span>}
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="password">Senha</label>
            <input id="password" type="password" className="input-field" {...register('password')} autoComplete="new-password" />
            {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-medium" htmlFor="state">Estado</label>
              <select id="state" className="input-field w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...register('state')}>
                <option value="">Selecione o estado</option>
                {estados.map((estado) => (
                  <option key={estado.sigla} value={estado.sigla}>{estado.nome}</option>
                ))}
              </select>
              {errors.state && <span className="text-red-500 text-sm">{errors.state.message}</span>}
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium" htmlFor="city">Cidade</label>
              <select id="city" className={`input-field w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !selectedState || loadingCidades 
                  ? 'border-gray-200 bg-gray-50 text-gray-500' 
                  : 'border-gray-300'
              }`} {...register('city')} disabled={!selectedState || loadingCidades}>
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
            <label className="block mb-1 font-medium" htmlFor="userType">Tipo de Usuário</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2" htmlFor="userType-sugar_baby">
                <input id="userType-sugar_baby" type="radio" value="sugar_baby" {...register('userType')} /> Sugar Baby
              </label>
              <label className="flex items-center gap-2" htmlFor="userType-sugar_daddy">
                <input id="userType-sugar_daddy" type="radio" value="sugar_daddy" {...register('userType')} /> Sugar Daddy
              </label>
              <label className="flex items-center gap-2" htmlFor="userType-sugar_mommy">
                <input id="userType-sugar_mommy" type="radio" value="sugar_mommy" {...register('userType')} /> Sugar Mommy
              </label>
              <label className="flex items-center gap-2" htmlFor="userType-sugar_babyboy">
                <input id="userType-sugar_babyboy" type="radio" value="sugar_babyboy" {...register('userType')} /> Sugar Babyboy
              </label>
            </div>
            {errors.userType && <span className="text-red-500 text-sm">{errors.userType.message}</span>}
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="lookingFor">Procuro</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2" htmlFor="lookingFor-male">
                <input id="lookingFor-male" type="radio" value="male" {...register('lookingFor')} /> Homens
              </label>
              <label className="flex items-center gap-2" htmlFor="lookingFor-female">
                <input id="lookingFor-female" type="radio" value="female" {...register('lookingFor')} /> Mulheres
              </label>
              <label className="flex items-center gap-2" htmlFor="lookingFor-both">
                <input id="lookingFor-both" type="radio" value="both" {...register('lookingFor')} /> Ambos
              </label>
            </div>
            {errors.lookingFor && <span className="text-red-500 text-sm">{errors.lookingFor.message}</span>}
          </div>
          <div className="flex items-center gap-2">
            <label className="block mb-1 font-medium" htmlFor="terms">Aceito os</label>
            <input id="terms" type="checkbox" {...register('terms')} />
            <span>
              <Link href="/terms" className="underline ml-1" target="_blank">Termos de Uso</Link>
              e a
              <Link href="/privacy" className="underline ml-1" target="_blank">Política de Privacidade</Link>
            </span>
          </div>
          {errors.terms && <span className="text-red-500 text-sm">{errors.terms.message}</span>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 text-white hover:from-yellow-500 hover:to-pink-600 focus:ring-2 focus:ring-yellow-300 focus:outline-none mt-4"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        <p className="text-center text-secondary-600 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="underline text-primary-600">Entrar</Link>
        </p>
      </div>
    </div>
  )
} 