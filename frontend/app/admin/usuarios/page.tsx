'use client';
import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Unlock, UserCheck, Shield, Eye, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  role: 'Dictator' | 'Sponsor';
  blocked?: boolean;
  failed_attempts?: number;
  last_login?: string;
  created_at?: string;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      alert('Usuario eliminado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  const handleUnlockUser = async (userId: string, username: string) => {
    if (!confirm(`¿Estás seguro de que quieres desbloquear al usuario "${username}"?`)) return;

    try {
      await api.post('/admin/unlock-user', { userId });
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, blocked: false, failed_attempts: 0 }
          : user
      ));
      
      alert(`Usuario "${username}" desbloqueado exitosamente`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al desbloquear usuario');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Dictator': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'Sponsor': return 'text-green-400 bg-green-900/20 border-green-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getUserStatus = (user: User) => {
    if (user.blocked || (user.failed_attempts && user.failed_attempts >= 3)) {
      return { status: 'Bloqueado', color: 'text-red-400 bg-red-900/20 border-red-600' };
    }
    return { status: 'Activo', color: 'text-green-400 bg-green-900/20 border-green-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-400">Administrar dictadores y sponsors del sistema</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Total Usuarios</span>
          </div>
          <div className="text-2xl font-bold text-white">{users.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Dictadores</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {users.filter(user => user.role === 'Dictator').length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Sponsors</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {users.filter(user => user.role === 'Sponsor').length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Unlock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Bloqueados</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {users.filter(user => user.blocked || (user.failed_attempts && user.failed_attempts >= 3)).length}
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No hay usuarios registrados
          </h3>
          <p className="text-gray-500">
            Los usuarios aparecerán aquí cuando se registren en el sistema
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={handleDeleteUser}
              onUnlock={handleUnlockUser}
              getRoleColor={getRoleColor}
              getUserStatus={getUserStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de usuario
function UserCard({
  user,
  onDelete,
  onUnlock,
  getRoleColor,
  getUserStatus
}: {
  user: User;
  onDelete: (id: string) => void;
  onUnlock: (id: string, username: string) => void;
  getRoleColor: (role: string) => string;
  getUserStatus: (user: User) => { status: string; color: string };
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const userStatus = getUserStatus(user);
  const isBlocked = user.blocked || (user.failed_attempts && user.failed_attempts >= 3);

  return (
    <>
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{user.username}</h3>
            <span className={`px-2 py-1 rounded text-xs border ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          </div>
          <span className={`px-2 py-1 rounded text-xs border ${userStatus.color}`}>
            {userStatus.status}
          </span>
        </div>

        {/* Información adicional */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">ID:</span>
            <span className="text-white font-mono text-xs">{user.id.slice(0, 8)}...</span>
          </div>
          
          {user.failed_attempts !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-400">Intentos fallidos:</span>
              <span className={`font-semibold ${user.failed_attempts >= 3 ? 'text-red-400' : 'text-white'}`}>
                {user.failed_attempts}
              </span>
            </div>
          )}

          {user.last_login && (
            <div className="flex justify-between">
              <span className="text-gray-400">Último acceso:</span>
              <span className="text-white">{new Date(user.last_login).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Alertas de estado */}
        {isBlocked && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Usuario bloqueado por intentos fallidos
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDetailsModal(true)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          >
            <Eye className="w-3 h-3" />
            Ver
          </button>
          
          {isBlocked && (
            <button
              onClick={() => onUnlock(user.id, user.username)}
              className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              title="Desbloquear usuario"
            >
              <Unlock className="w-3 h-3" />
              Desbloquear
            </button>
          )}

          <button
            onClick={() => onDelete(user.id)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            title="Eliminar usuario"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modal de detalles del usuario */}
      {showDetailsModal && (
        <UserDetailsModal
          user={user}
          onClose={() => setShowDetailsModal(false)}
          getRoleColor={getRoleColor}
          getUserStatus={getUserStatus}
        />
      )}
    </>
  );
}

// Modal de detalles del usuario
function UserDetailsModal({
  user,
  onClose,
  getRoleColor,
  getUserStatus
}: {
  user: User;
  onClose: () => void;
  getRoleColor: (role: string) => string;
  getUserStatus: (user: User) => { status: string; color: string };
}) {
  const userStatus = getUserStatus(user);
  const isBlocked = user.blocked || (user.failed_attempts && user.failed_attempts >= 3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold text-red-600">
            Detalles del Usuario
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Información Básica</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre de usuario:</span>
                <span className="text-white font-semibold">{user.username}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Rol:</span>
                <span className={`px-2 py-1 rounded text-xs border ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <span className={`px-2 py-1 rounded text-xs border ${userStatus.color}`}>
                  {userStatus.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">ID de usuario:</span>
                <span className="text-white font-mono text-sm">{user.id}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Seguridad</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Intentos fallidos:</span>
                <span className={`font-semibold ${
                  (user.failed_attempts && user.failed_attempts >= 3) ? 'text-red-400' : 'text-green-400'
                }`}>
                  {user.failed_attempts || 0} / 3
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-400">Cuenta bloqueada:</span>
                <span className={`font-semibold ${isBlocked ? 'text-red-400' : 'text-green-400'}`}>
                  {isBlocked ? 'Sí' : 'No'}
                </span>
              </div>
              
              {user.last_login && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Último acceso:</span>
                  <span className="text-white">
                    {new Date(user.last_login).toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha de creación:</span>
                <span className="text-white">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'No disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de seguridad */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Alerta de Seguridad
            </h4>
            <p className="text-red-300 text-sm">
              Esta cuenta está bloqueada debido a múltiples intentos de acceso fallidos. 
              El usuario no puede iniciar sesión hasta que un administrador desbloquee la cuenta.
            </p>
          </div>
        )}

        {/* Historial de actividad */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sesiones activas:</span>
              <span className="text-white">1</span>
            </div>
          </div>
        </div>

        {/* Botón de cerrar */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
