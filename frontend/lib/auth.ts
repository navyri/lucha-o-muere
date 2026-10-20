export const AuthUtils = {
  // Obtener token de localStorage o cookies
  getToken(): string | null {
    // Prioridad: localStorage primero, luego cookies
    let token = localStorage.getItem('token');
    
    if (!token) {
      // Buscar en cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
      if (tokenCookie) {
        token = tokenCookie.split('=')[1];
        // Sincronizar a localStorage
        if (token) {
          localStorage.setItem('token', token);
        }
      }
    }
    
    return token;
  },

  // Guardar token en ambos lugares
  setToken(token: string): void {
    localStorage.setItem('token', token);
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Strict`;
  },

  // Limpiar token de ambos lugares
  clearToken(): void {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },

  // Verificar si el token es válido
  isValidToken(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return !!(payload.id && payload.role && (!payload.exp || payload.exp > now));
    } catch {
      return false;
    }
  }
};
