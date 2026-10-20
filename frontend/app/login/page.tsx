'use client';
import { useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  useEffect(() => {
    // Sincronizar token de cookies a localStorage si existe
    const syncTokenFromCookies = () => {
      // Obtener token de cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        const localStorageToken = localStorage.getItem('token');
        
        // Si hay token en cookies pero no en localStorage, sincronizar
        if (token && !localStorageToken) {
          try {
            // Verificar que el token sea válido antes de guardarlo
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp > now) {
              // Token válido, guardarlo en localStorage
              localStorage.setItem('token', token);
              console.log('Token sincronizado de cookies a localStorage');
              
              // Redirigir a welcome ya que tiene sesión válida
              window.location.href = '/welcome';
            } else {
              // Token expirado, limpiarlo
              document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              console.log('🗑️ Token expirado eliminado de cookies');
            }
          } catch (error) {
            // Token inválido, limpiarlo
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            console.log('🗑️ Token inválido eliminado de cookies');
          }
        }
      }
    };

    syncTokenFromCookies();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <LoginForm />
    </div>
  );
}
