'use client';
import { useState } from 'react';
import { Eye, EyeOff, Sword, Shield, Crown, User, Lock, LogIn } from 'lucide-react';
import api from '@/lib/api';

export default function LoginForm() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', credentials);

            // Guardar en localStorage
            localStorage.setItem('token', response.data.token);
            
            // Guardar en cookies para que el middleware pueda leerlo
            document.cookie = `token=${response.data.token}; path=/; max-age=86400; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;

            console.log('Token guardado en localStorage y cookies');

            // Redirección
            if (response.data.message?.includes('activar')) {
                window.location.replace('/activate');
            } else {
                window.location.replace('/welcome');
            }
            
        } catch (error: any) {
            setError(error.response?.data?.error || 'Error al iniciar sesión');
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 ">
            <div className="relative w-full max-w-md">
                {/* Contenedor principal */}
                <div className="bg-[#0f0f0f] border border-[#222] rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-red-600 mb-2">Lucha o Muere</h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg text-red-400 text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Usuario
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ingresa tu usuario"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all duration-200 placeholder-gray-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Ingresa tu contraseña"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full p-3 pr-12 bg-[#1a1a1a] border border-[#333] text-white rounded-lg focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all duration-200 placeholder-gray-500"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors duration-200"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full p-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/25 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Entrar a la Arena
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-[#333]">
                        <div className="text-center text-gray-500 text-xs">
                            <div className="flex justify-center items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Sword className="w-3 h-3" />
                                    <span>Gladiadores</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    <span>Sponsors</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    <span>Dictadores</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent rounded-2xl blur-xl -z-10"></div>
            </div>
        </div>
    );
}
