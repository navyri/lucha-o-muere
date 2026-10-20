'use client';

import { useState, useEffect } from 'react';
import { Skull, Home, Plus,Users, Sword, Calendar, Crown, ShoppingBag, Package, Settings, Menu, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import clsx from 'clsx';

interface NavItem {
  name: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const getNavItemsByRole = (userRole: string): NavItem[] => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', Icon: Home },
  ];

  switch (userRole) {
    case 'Admin':
      return [
        ...baseItems,
        { name: 'Crear Usuario', href: '/admin/crear-usuario', Icon: Plus },
        { name: 'Usuarios', href: '/admin/usuarios', Icon: Users },
        { name: 'Batallas', href: '/admin/batallas', Icon: Sword }, 
      ];
    
    case 'Dictator':
      return [
        ...baseItems,
        { name: 'Contestants', href: '/dictator/contestants', Icon: Crown },
        { name: 'Inventario', href: '/dictator/inventario', Icon: Package },
        { name: 'Black Market', href: '/dictator/blackmarket', Icon: ShoppingBag },
        { name: 'Batallas', href: '/dictator/batallas', Icon: Sword },
        { name: 'Apuestas', href: '/dictator/apuestas', Icon: TrendingUp },
      ];
    
    case 'Sponsor':
      return [
        ...baseItems,
        { name: 'Contestants', href: '/sponsor/contestants', Icon: Crown },
        { name: 'Inventario', href: '/sponsor/inventario', Icon: Package },
        { name: 'Black Market', href: '/sponsor/blackmarket', Icon: ShoppingBag },
        { name: 'Batallas', href: '/sponsor/batallas', Icon: Sword },
        { name: 'Apuestas', href: '/sponsor/apuestas', Icon: TrendingUp },
      ];
    
    default:
      return [
        { name: 'Inicio', href: '/', Icon: Home },
      ];
  }
};

interface SideBarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ 
  isMobileOpen = false, 
  onMobileClose 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [items, setItems] = useState<NavItem[]>([]);

  useEffect(() => {
    // Obtener el rol del usuario desde localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || '';
        
        setUserRole(role);
        const generatedItems = getNavItemsByRole(role);
        setItems(generatedItems);
        
      } catch (error) {
        console.error('Error al decodificar token:', error);
        setItems(getNavItemsByRole(''));
      }
    } else {
      console.log('No hay token, usando items por defecto');
      setItems(getNavItemsByRole(''));
    }
  }, []);

  const handleMobileClose = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  // Sidebar móvil simplificado
  if (isMobileOpen) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-[#0f0f0f] border-r border-[#222] shadow-inner">
          <div className="flex items-center justify-center h-16 border-b border-[#222]">
            <h2 className="text-xl font-bold tracking-wide text-red-600">Busca tu destino</h2>
          </div>
          <nav className="flex flex-col flex-1 p-2 overflow-auto space-y-1">
            {items.map(({ name, href, Icon }) => (
              <Link
                key={name}
                href={href}
                className="flex items-center px-3 py-2 rounded-md hover:bg-red-700/20 hover:text-red-400 transition-colors duration-300"
                onClick={handleMobileClose}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{name}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Sidebar para desktop y Sheet alternativo
  const MobileSidebar = (
    <div className="md:hidden p-2">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="w-6 h-6 text-red-600" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-[#0f0f0f] text-gray-200 border-r border-[#222] p-0">
          <aside className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 border-b border-[#222]">
              <h2 className="text-xl font-bold tracking-wide text-red-600">Busca tu destino</h2>
            </div>
            <nav className="flex flex-col flex-1 p-2 overflow-auto space-y-1">
              {items.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  className="flex items-center justify-start px-3 py-2 rounded-md hover:bg-red-700/20 hover:text-red-400 transition-colors duration-300"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </SheetContent>
      </Sheet>
    </div>
  );

  const DesktopSidebar = (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={clsx(
        'hidden md:flex flex-col bg-[#0f0f0f] border-r border-[#222] text-gray-200 shadow-inner select-none',
        'transition-[width] duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-[#222]">
        {isExpanded ? (
          <h2 className="text-xl font-bold tracking-wide text-red-600">Busca tu destino</h2>
        ) : (
          <Skull className="w-6 h-6 text-red-600" />
        )}
      </div>
      <nav className="flex flex-col flex-1 p-2 overflow-auto space-y-1">
        {items.map(({ name, href, Icon }) => (
          <Link
            key={name}
            href={href}
            className={clsx(
              'flex items-center rounded-md px-3 py-2 hover:bg-red-700/20 hover:text-red-400 transition-colors duration-300',
              isExpanded ? 'justify-start' : 'justify-center'
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {isExpanded && <span>{name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );

  return (
    <>
      {MobileSidebar}
      {DesktopSidebar}
    </>
  );
};

export default SideBar;
