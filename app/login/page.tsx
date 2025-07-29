"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('Formulário de login enviado', { email, password });
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/profile");
      } else if (res?.error) {
        if (res.error.includes("confirmar seu email")) {
          setError("Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.");
        } else {
          setError("E-mail ou senha inválidos");
        }
      } else {
        setError("E-mail ou senha inválidos");
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <div className="fixed top-2 left-2 z-50 bg-yellow-200 text-pink-700 px-3 py-1 rounded shadow">Teste JS</div>
      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img
          src="/landing/baby-1.png"
          alt="Banner Bebaby - imagem de fundo da tela de login"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-pink-900/60" />
      </div>
      {/* Formulário centralizado */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 bg-white/30 rounded-2xl shadow-xl border border-yellow-300/60 backdrop-blur-md">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">E-mail ou Usuário</label>
            <input
              id="email"
              type="text"
              placeholder="Digite seu e-mail ou nome de usuário"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field focus:ring-4 focus:ring-pink-400 focus:border-pink-600 placeholder:text-gray-700"
              required
              disabled={loading}
              autoComplete="username"
              aria-label="E-mail ou Usuário"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 font-medium">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field focus:ring-4 focus:ring-pink-400 focus:border-pink-600 placeholder:text-gray-700"
              required
              disabled={loading}
              autoComplete="current-password"
              aria-label="Senha"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-lg shadow-md transition-all duration-300 bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 text-white hover:from-yellow-500 hover:to-pink-600 focus:ring-4 focus:ring-pink-400 focus:outline-none mt-4"
            aria-label="Entrar"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes("confirmar seu email") && (
              <div className="mt-2">
                <Link
                  href="/verify-email"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Ir para verificação de email
                </Link>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 text-center">
          <p className="text-secondary-600">
            Não tem uma conta?{' '}
            <Link href="/register" className="underline text-primary-600" aria-label="Ir para tela de cadastro">Criar conta</Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/reset-password"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
} 