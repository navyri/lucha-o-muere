'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogIn, LogOut, Trash2 } from 'lucide-react';
import SideBar from './Sidebar';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [hasTokenIssues, setHasTokenIssues] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    let token = localStorage.getItem('token');
    let tokenFromCookies = null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
    if (tokenCookie) {
      tokenFromCookies = tokenCookie.split('=')[1];
    }

    if (tokenFromCookies && !token) {
      setHasTokenIssues(true);
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        // DEBUG - Solo esta línea agregada
        console.log('DEBUG TOKEN:', payload);

        if (payload.exp && payload.exp < now) {
          setHasTokenIssues(true);
          return;
        }

        setIsAuthenticated(true);
        
        const actualUsername = payload.username || payload.name || 'Usuario';
        const actualRole = payload.role || 'Sin rol';
        
        setUsername(actualUsername);
        setUserRole(actualRole);
        setHasTokenIssues(false);
      } catch (error) {
        setHasTokenIssues(true);
      }
    } else {
      setIsAuthenticated(false);
      setUsername('');
      setUserRole('');
      setHasTokenIssues(false);
    }
  };

  const handleForceLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = '__next_hmr_refresh_hash__=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    setIsAuthenticated(false);
    setUsername('');
    setUserRole('');
    setHasTokenIssues(false);
    
    console.log('Sesión forzada a cerrar');
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setIsAuthenticated(false);
    setUsername('');
    setUserRole('');
    window.location.href = '/';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isMenuOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="relative z-50 flex items-center justify-between px-6 py-3 bg-[#0f0f0f] border-b border-[#222] shadow-inner">
        <button
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Cerrar menú móvil' : 'Abrir menú móvil'}
          className="md:hidden text-red-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link href="/" className="select-none text-2xl font-bold tracking-widest text-red-700 hover:text-red-600 transition-colors">
          Lucha o Muere
        </Link>

        {hasTokenIssues && (
          <button
            onClick={handleForceLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            title="Limpiar sesión problemática"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden md:block">Limpiar Sesión</span>
          </button>
        )}

        {isAuthenticated ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <div className="text-right">
                <div className="text-white font-medium">{username}</div>
                <div className="text-xs text-gray-400">{userRole}</div>
              </div>
            </Link>
            <div className="relative w-10 h-10">
              <Image
                src="https://i.pinimg.com/736x/e7/3c/3c/e73c3c220e8beb0b1e25d4082f757e50.jpg"
                alt="Avatar"
                fill
                className="rounded-full border border-red-700 shadow-md object-cover"
              />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:block">Salir</span>
            </button>
          </div>
        ) : !hasTokenIssues ? (
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          </div>
        ) : null}

        <div className="md:hidden">
          {hasTokenIssues ? (
            <button
              onClick={handleForceLogout}
              className="text-red-600 hover:text-red-700"
              title="Limpiar sesión"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{username}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-red-600 hover:text-red-700"
            >
              <LogIn className="w-6 h-6" />
            </Link>
          )}
        </div>
      </header>

      {isMenuOpen && (
        <div ref={sidebarRef}>
          <SideBar isMobileOpen={true} onMobileClose={closeMenu} />
        </div>
      )}
    </>
  );
}
