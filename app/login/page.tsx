'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Command, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                const data = await res.json();
                setError(data.error || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-4 shadow-lg shadow-slate-900/20">
                            <Command size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h1>
                        <p className="text-slate-500 text-sm mt-2">Ingresa tus credenciales para acceder al panel</p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center animate-in fade-in slide-in-from-top-2">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                Correo Electrónico
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-slate-900">
                                    <Mail className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all duration-200 sm:text-sm"
                                    placeholder="nombre@empresa.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                                Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-slate-900">
                                    <Lock className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all duration-200 sm:text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-slate-900/20 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        Ingresar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-slate-400">
                            &copy; {new Date().getFullYear()} Famiglia - Grupo N°01 - Pernity. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
