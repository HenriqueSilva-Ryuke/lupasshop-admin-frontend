'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';

async function adminLogin(email: string, password: string) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              fullName
              email
              role
            }
          }
        }
      `,
      variables: { input: { email, password } },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  const { token, user } = json.data.login;
  if (user.role !== 'ADMIN') throw new Error('Acesso restrito a administradores');
  return { token, user };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token, user } = await adminLogin(email.trim(), password);
      login(token, user);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">LupaShop Admin</h1>
          <p className="text-sm text-muted-foreground">Backoffice Central — acesso restrito</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
              <Lock className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@lupashop.ao"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Palavra-passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> A autenticar...</>
            ) : (
              'Entrar no Backoffice'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Apenas administradores autorizados podem aceder a este painel.
        </p>
      </div>
    </div>
  );
}
