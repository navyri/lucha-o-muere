'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Users, ShoppingBag, Sword, Calendar, Package, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  role: 'Admin' | 'Dictator' | 'Sponsor';
  username: string;
}

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.id,
        role: payload.role,
        username: payload.username || `Usuario ${payload.role}`
      });
    } catch (error) {
      console.error('Error al decodificar token:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header de bienvenida */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            {user.role === 'Admin' && <Users className="w-20 h-20 text-red-600" />}
            {user.role === 'Dictator' && <Crown className="w-20 h-20 text-red-600" />}
            {user.role === 'Sponsor' && <ShoppingBag className="w-20 h-20 text-red-600" />}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-red-600 mb-4">
            ¡Bienvenido al Arena!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            {user.username}
          </h2>
          <p className="text-xl text-gray-400">
            Rol: <span className="text-red-400 font-semibold">{user.role}</span>
          </p>
        </div>

        {/* Contenido específico por rol */}
        {user.role === 'Admin' && <AdminWelcome />}
        {user.role === 'Dictator' && <DictatorWelcome />}
        {user.role === 'Sponsor' && <SponsorWelcome />}

        {/* Botón para continuar */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg transition-colors shadow-lg"
          >
            Continuar al Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Bienvenida para Admin
function AdminWelcome() {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-8">
      <h3 className="text-2xl font-bold text-red-600 mb-6">
        Panel de Control Supremo
      </h3>
      <p className="text-gray-300 mb-6">
        Como Administrador, tienes control total sobre el sistema de combates. 
        Puedes gestionar usuarios, aprobar batallas y supervisar todos los eventos.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Gestión de Usuarios</h4>
          <p className="text-gray-400 text-sm">Crear y administrar Dictadores y Sponsors</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Sword className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Control de Batallas</h4>
          <p className="text-gray-400 text-sm">Aprobar, iniciar y finalizar combates</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Eventos Especiales</h4>
          <p className="text-gray-400 text-sm">Crear torneos y eventos únicos</p>
        </div>
      </div>
    </div>
  );
}

// Bienvenida para Dictador
function DictatorWelcome() {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-8">
      <h3 className="text-2xl font-bold text-red-600 mb-6">
        Dominio Territorial
      </h3>
      <p className="text-gray-300 mb-6">
        Como Dictador, controlas un territorio y sus gladiadores. Entrena a tus contestants, 
        propón batallas épicas y expande tu dominio a través de la conquista.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Crown className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Tus Gladiadores</h4>
          <p className="text-gray-400 text-sm">Gestiona y entrena a tus contestants</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Sword className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Proponer Batallas</h4>
          <p className="text-gray-400 text-sm">Organiza combates contra otros dictadores</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <ShoppingBag className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Mercado Negro</h4>
          <p className="text-gray-400 text-sm">Compra armas y mejoras para tus gladiadores</p>
        </div>
      </div>
    </div>
  );
}

// Bienvenida para Sponsor
function SponsorWelcome() {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-8">
      <h3 className="text-2xl font-bold text-red-600 mb-6">
        Imperio Corporativo
      </h3>
      <p className="text-gray-300 mb-6">
        Como Sponsor, tu poder radica en el patrocinio estratégico. Invierte en gladiadores 
        prometedores, comercia en el mercado negro y maximiza tus ganancias.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Crown className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Patrocinar Gladiadores</h4>
          <p className="text-gray-400 text-sm">Apoya a los mejores contestants con items</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <Package className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Gestionar Inventario</h4>
          <p className="text-gray-400 text-sm">Administra tu arsenal de items y armas</p>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <ShoppingBag className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="font-semibold text-white mb-2">Comercio Estratégico</h4>
          <p className="text-gray-400 text-sm">Vende items y realiza inversiones inteligentes</p>
        </div>
      </div>
    </div>
  );
}
