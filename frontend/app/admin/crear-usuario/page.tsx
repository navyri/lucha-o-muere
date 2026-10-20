'use client';
import { useState } from 'react';
import { Users, Crown, ShoppingBag, Plus } from 'lucide-react';
import api from '@/lib/api';

export default function CrearUsuarioPage() {
  const [activeTab, setActiveTab] = useState<'dictator' | 'sponsor'>('dictator');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const endpoint = activeTab === 'dictator' ? '/admin/register-dictator' : '/admin/register-sponsor';
      
      await api.post(endpoint, {
        username: formData.username,
        password: formData.password
      });

      setMessage(`${activeTab === 'dictator' ? 'Dictador' : 'Sponsor'} creado exitosamente`);
      setFormData({ username: '', password: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          <Plus className="w-8 h-8" />
          Crear Nuevo Usuario
        </h1>
        <p className="text-gray-400">Registrar nuevos Dictadores y Sponsors en el sistema</p>
      </div>

      {/*  Layout con formulario a la izquierda y permisos a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/*  Columna Izquierda - Formulario */}
        <div>
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg max-w-md">
              <button
                onClick={() => setActiveTab('dictator')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'dictator'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                Dictador
              </button>
              <button
                onClick={() => setActiveTab('sponsor')}
                className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'sponsor'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Sponsor
              </button>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-white mb-6">
              Crear {activeTab === 'dictator' ? 'Dictador' : 'Sponsor'}
            </h2>

            {message && (
              <div className={`mb-4 p-3 rounded border ${
                message.includes('exitosamente') 
                  ? 'bg-green-900/20 border-green-600 text-green-400'
                  : 'bg-red-900/20 border-red-600 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Nombre de Usuario</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  placeholder="Ingresa el username"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  placeholder="Contraseña"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  placeholder="Confirma la contraseña"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                {loading ? (
                  <>Creando...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear {activeTab === 'dictator' ? 'Dictador' : 'Sponsor'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Columna Derecha - Información de Permisos */}
        <div className="lg:pl-4">
          <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 h-fit">
            <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
              {activeTab === 'dictator' ? <Crown className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              Permisos de {activeTab === 'dictator' ? 'Dictador' : 'Sponsor'}
            </h3>
            
            {activeTab === 'dictator' ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Gestionar Contestants</h4>
                    <p className="text-gray-400 text-sm">Administrar gladiadores y sus estadísticas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Proponer Batallas</h4>
                    <p className="text-gray-400 text-sm">Crear y programar combates entre gladiadores</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Apostar en Combates</h4>
                    <p className="text-gray-400 text-sm">Participar en el sistema de apuestas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Mercado Negro</h4>
                    <p className="text-gray-400 text-sm">Comprar items especiales y mejoras</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Gestionar Inventario</h4>
                    <p className="text-gray-400 text-sm">Administrar items y recursos disponibles</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Patrocinar Contestants</h4>
                    <p className="text-gray-400 text-sm">Apoyar gladiadores con items y mejoras</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Vender en Mercado</h4>
                    <p className="text-gray-400 text-sm">Comercializar items en el mercado negro</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-white font-medium">Apostar en Batallas</h4>
                    <p className="text-gray-400 text-sm">Participar en el sistema de apuestas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="mt-6 pt-4 border-t border-[#333]">
              <p className="text-gray-500 text-xs">
                Los permisos se asignan automáticamente según el rol seleccionado. 
                El usuario podrá acceder a estas funcionalidades inmediatamente después del registro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
