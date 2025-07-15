"use client"

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      toast.success("Login realizado com sucesso!");
      router.push("/profile");
    } else {
      toast.error("E-mail ou senha inválidos");
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
          Entrar
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold hover:bg-pink-600 transition-colors disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link href="/reset-password" className="text-pink-700 hover:underline">Esqueceu a senha?</Link>
          <span className="text-gray-700">Não tem conta? <Link href="/register" className="text-pink-700 hover:underline">Cadastre-se</Link></span>
        </div>
      </div>
    </div>
  );
} 