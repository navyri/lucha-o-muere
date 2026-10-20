'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Sword, Plus, Calendar, Crown, ShoppingBag, Package, Settings, LogOut, Loader2, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  role: 'Admin' | 'Dictator' | 'Sponsor';
  username: string;
}

export default function DashboardPage() {
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header simplificado sin botón de logout */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600">
          Bienvenido, {user.username}
        </h1>
        <p className="text-gray-400">Rol: {user.role}</p>
      </div>

      {/* Dashboard específico por rol */}
      {user.role === 'Admin' && <AdminDashboard />}
      {user.role === 'Dictator' && <DictatorDashboard />}
      {user.role === 'Sponsor' && <SponsorDashboard />}
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Gestión de Usuarios"
        description="Ver y administrar usuarios existentes"
        href="/admin/usuarios"
        Icon={Users}
      />
      <DashboardCard
        title="Crear Usuario"
        description="Registrar nuevos Dictadores y Sponsors"
        href="/admin/crear-usuario"
        Icon={Plus}
      />
      <DashboardCard
        title="Aprobar Batallas"
        description="Revisar y aprobar batallas propuestas"
        href="/admin/batallas"
        Icon={Sword}
      />
    </div>
  );
}

function DictatorDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Contestants"
        description="Gestionar tus esclavos"
        href="/dictator/contestants"
        Icon={Crown}
      />
      <DashboardCard
        title="Inventario"
        description="Mira tus productos disponibles"
        href="/dictator/inventario"
        Icon={Package}
      />
      <DashboardCard
        title="Black Market"
        description="Comprar items especiales"
        href="/dictator/black-market"
        Icon={ShoppingBag}
      />
      <DashboardCard
        title="Proponer Batalla"
        description="Crear nuevas batallas"
        href="/dictator/batallas"
        Icon={Sword}
      />
      <DashboardCard
        title="Realiza Apuestas"
        description="Prueba tu suerte en batallas"
        href="/dictator/apuestas"
        Icon={TrendingUp}
      />
    </div>
  );
}

function SponsorDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard
        title="Apoyar Contestants"
        description="Dar items a gladiadores"
        href="/sponsor/contestants"
        Icon={Crown}
      />
      <DashboardCard
        title="Inventario"
        description="Mira tus productos disponibles"
        href="/sponsor/inventario"
        Icon={Package}
      />
      <DashboardCard
        title="Black Market"
        description="Vender items en el mercado negro"
        href="/sponsor/black-market"
        Icon={ShoppingBag}
      />
      <DashboardCard
        title="Batallas"
        description="Presencia y ayuda en batallas"
        href="/sponsor/batallas"
        Icon={Sword}
      />
      <DashboardCard
        title="Realiza Apuestas"
        description="Prueba tu suerte en batallas"
        href="/sponsor/apuestas"
        Icon={TrendingUp}
      />
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  href, 
  Icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  Icon: React.ComponentType<{ className?: string }>; 
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-[#0f0f0f] border border-[#222] rounded-lg hover:border-red-600 transition-colors group"
    >
      <Icon className="w-8 h-8 text-red-600 group-hover:text-red-400 mb-4 transition-colors" />
      <h3 className="text-xl font-semibold text-red-600 group-hover:text-red-400 mb-2 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400">{description}</p>
    </a>
  );
}
