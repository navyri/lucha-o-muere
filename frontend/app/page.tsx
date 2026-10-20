'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sword, Crown, LogIn, Skull, Zap, Users, ShieldAlert } from 'lucide-react';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header épico */}
        <div className="mb-8">
          <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6 animate-pulse" />
          
          <h1 className="text-5xl md:text-7xl font-bold text-red-600 mb-4 tracking-wider">
            LUCHA POR TU
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            LIBERTAD O MUERE
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">
            ¿Eres nuevo? Los accesos son otorgados exclusivamente por el Administrador del sistema. 
            Contacta al Admin para obtener tus credenciales de acceso.
        </p>
        </div>

        {/* Roles del sistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
            <Crown className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Dictadores</h3>
            <p className="text-gray-400 mb-4">
              Aliados regionales de Carolina que controlan territorios y esclavos
            </p>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Gestionar esclavos (contestants)</li>
              <li>• Organizar combates mortales</li>
              <li>• Apostar en las batallas</li>
              <li>• Comprar armas en el mercado negro</li>
            </ul>
          </div>
          
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
            <Sword className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Gladiadores</h3>
            <p className="text-gray-400 mb-4">
              Ex-estudiantes, profesores y prisioneros que luchan por su libertad
            </p>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Sobrevivir a los combates</li>
              <li>• Ganar batallas para obtener libertad</li>
              <li>• Recibir armas de patrocinadores</li>
              <li>• Escalar en los rankings</li>
            </ul>
          </div>
          
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
            <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Sponsors</h3>
            <p className="text-gray-400 mb-4">
              Corporaciones malvadas que patrocinan luchadores con armas y drogas
            </p>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Patrocinar gladiadores favoritos</li>
              <li>• Vender armas y mejoras</li>
              <li>• Invertir en combates</li>
              <li>• Comerciar en el mercado negro</li>
            </ul>
          </div>
        </div>

        {/* Características del sistema */}
        <div className="bg-red-900/10 border border-red-600 rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center justify-center gap-2">
            <Zap className="w-6 h-6" />
            El Sistema de Combate Definitivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-3">Gestión de Esclavos</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Información detallada de todos los cautivos</li>
                <li>• Seguimiento de batallas sobrevividas</li>
                <li>• Rankings por habilidades de combate</li>
                <li>• Estado: Vivo, Muerto, Escapado, Libre</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-3">Combates Mortales</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Registro y programación de peleas</li>
                <li>• Resultados de combates en tiempo real</li>
                <li>• Sistema de apuestas para espectadores</li>
                <li>• Estadísticas de lesiones y traiciones</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-3">Control Dictatorial</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Territorios y aliados regionales</li>
                <li>• Asignación de esclavos por región</li>
                <li>• Monitoreo de niveles de lealtad</li>
                <li>• Eventos especiales de codificación mortal</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-red-400 mb-3">Mercado Negro</h4>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Patrocinio con armas especiales</li>
                <li>• Drogas de mejora de rendimiento</li>
                <li>• Sobornos y transacciones secretas</li>
                <li>• Rescates entre dictadores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advertencia final */}
        <div className="bg-black border-2 border-[#222] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-red-600 mb-3 flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            ADVERTENCIA FINAL
          </h3>
          <p className="text-white font-semibold">
            El Admin te está observando. Si tu sistema no cumple con las expectativas, 
            podría obligarte a participar en el próximo torneo.
          </p>
        </div>
      </div>
    </div>
  );
}
