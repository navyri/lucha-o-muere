'use client';
import { useState, useEffect, JSX } from 'react';
import { Sword, CheckCircle, XCircle, Play, Clock, Users, Filter, TrendingUp, Skull, AlertTriangle, Info } from 'lucide-react';
import api from '@/lib/api';

interface Battle {
  id: string;
  contestant_1: string;
  contestant_2: string;
  contestant_1_name?: string;
  contestant_1_nickname?: string;
  contestant_2_name?: string;
  contestant_2_nickname?: string;
  dictator_1_name?: string;
  dictator_2_name?: string;
  status: 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected' | 'Start';
  proposed_date: string;
  winner_id?: string;
  created_at: string;
  battle_date?: string;
  death_occurred?: boolean;
  casualty_id?: string;
  injuries?: string;
  dictator_id?: string;
}

export default function AdminBatallasPage() {
  const [allBattles, setAllBattles] = useState<Battle[]>([]);
  const [pendingBattles, setPendingBattles] = useState<Battle[]>([]);
  const [inProgressBattles, setInProgressBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'all'>('pending');
  
  // Estados para modales personalizados
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    fetchBattles();
  }, []);

  // Función para mostrar notificaciones personalizadas
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotificationModal(true);
  };

  const fetchBattles = async () => {
    try {
      setLoading(true);
      setError('');

      try {
        const pendingBattlesResponse = await api.get('/admin/get-Pending-Battles');
        const pendingBattlesData = Array.isArray(pendingBattlesResponse.data.battles) 
          ? pendingBattlesResponse.data.battles 
          : Array.isArray(pendingBattlesResponse.data) 
          ? pendingBattlesResponse.data 
          : [];
        
        setPendingBattles(pendingBattlesData);
      } catch (pendingError: any) {
        console.error('Error cargando batallas pendientes:', pendingError);
        setPendingBattles([]);
      }

      try {
        const allBattlesResponse = await api.get('/admin/get-All-Battles');
        const allBattlesData = Array.isArray(allBattlesResponse.data) ? allBattlesResponse.data : [];
        setAllBattles(allBattlesData);
        
        const inProgressData = allBattlesData.filter((battle: Battle) => 
          battle.status === 'In Progress' || 
          battle.status === 'Start' || 
          battle.status === 'Approved'
        );
        setInProgressBattles(inProgressData);
        
      } catch (allBattlesError: any) {
        console.error('Error cargando todas las batallas:', allBattlesError);
        setAllBattles(pendingBattles);
        setInProgressBattles([]);
        setError('Error al cargar todas las batallas. Mostrando solo batallas pendientes.');
      }

    } catch (error: any) {
      console.error('Error general:', error);
      setError('Error de conexión con el servidor');
      setAllBattles([]);
      setPendingBattles([]);
      setInProgressBattles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBattle = async (battleId: string) => {
    try {
      await api.post('/admin/Aprove-Battles', { battleId });
      fetchBattles();
      showNotification('Batalla aprobada exitosamente', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Error al aprobar batalla', 'error');
    }
  };

  const handleStartBattle = async (battleId: string) => {
    try {
      await api.post(`/admin/start/${battleId}`);
      fetchBattles();
      showNotification('Batalla iniciada exitosamente', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Error al iniciar batalla', 'error');
    }
  };

  const handleCloseBattle = async (battleId: string, winnerId: string, deathOccurred: boolean = false) => {
    try {
      await api.post(`/admin/Close/${battleId}`, { 
        winnerId,
        deathOccurred 
      });
      fetchBattles();
      showNotification('Batalla finalizada exitosamente', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.error || 'Error al cerrar batalla', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'Approved': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'In Progress':
      case 'Start': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      case 'Completed': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      case 'Rejected': return 'text-red-400 bg-red-900/20 border-red-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
      case 'Start': return <Play className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando batallas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Sword className="w-8 h-8" />
            Gestión de Batallas
          </h1>
          <p className="text-gray-400">Aprobar, iniciar y finalizar batallas del arena</p>
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
            <Sword className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Total Batallas</span>
          </div>
          <div className="text-2xl font-bold text-white">{allBattles.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Pendientes</span>
          </div>
          <div className="text-2xl font-bold text-white">{pendingBattles.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Play className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Activas / En Progreso</span>
          </div>
          <div className="text-2xl font-bold text-white">{inProgressBattles.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-semibold">Completadas</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {allBattles.filter(b => b.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'pending'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pendientes ({pendingBattles.length})
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'in-progress'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Activas / En Progreso ({inProgressBattles.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todas ({allBattles.length})
          </button>
        </div>
      </div>

      {/* Contenido de tabs */}
      {activeTab === 'pending' && (
        <BattlesList
          battles={pendingBattles}
          onApprove={handleApproveBattle}
          onStart={handleStartBattle}
          onClose={handleCloseBattle}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          type="pending"
        />
      )}

      {activeTab === 'in-progress' && (
        <BattlesList
          battles={inProgressBattles}
          onApprove={handleApproveBattle}
          onStart={handleStartBattle}
          onClose={handleCloseBattle}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          type="in-progress"
        />
      )}

      {activeTab === 'all' && (
        <BattlesList
          battles={allBattles}
          onApprove={handleApproveBattle}
          onStart={handleStartBattle}
          onClose={handleCloseBattle}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          type="all"
        />
      )}

      {/* Modal de notificación personalizado */}
      {showNotificationModal && (
        <NotificationModal
          message={notificationMessage}
          type={notificationType}
          onClose={() => setShowNotificationModal(false)}
        />
      )}
    </div>
  );
}

function BattlesList({
  battles,
  onApprove,
  onStart,
  onClose,
  getStatusColor,
  getStatusIcon,
  type
}: {
  battles: Battle[];
  onApprove: (id: string) => void;
  onStart: (id: string) => void;
  onClose: (id: string, winnerId: string, deathOccurred: boolean) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  type: 'pending' | 'in-progress' | 'all';
}) {
  const safeBattles = Array.isArray(battles) ? battles : [];

  if (safeBattles.length === 0) {
    const getEmptyMessage = () => {
      switch (type) {
        case 'pending': return 'No hay batallas pendientes';
        case 'in-progress': return 'No hay batallas activas o en progreso';
        case 'all': return 'No hay batallas registradas';
        default: return 'No hay batallas';
      }
    };

    const getEmptyDescription = () => {
      switch (type) {
        case 'pending': return 'Las batallas propuestas aparecerán aquí para su aprobación';
        case 'in-progress': return 'Las batallas aprobadas e iniciadas aparecerán aquí para su gestión';
        case 'all': return 'Las batallas aparecerán aquí cuando sean creadas';
        default: return 'Las batallas aparecerán aquí';
      }
    };

    return (
      <div className="text-center py-12">
        <Sword className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-400 mb-2">
          {getEmptyMessage()}
        </h3>
        <p className="text-gray-500">
          {getEmptyDescription()}
        </p>
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
          <p className="text-blue-400 text-sm">
            Sistema funcionando correctamente - {getEmptyMessage().toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {safeBattles.map((battle) => (
        <BattleCard
          key={battle.id}
          battle={battle}
          onApprove={onApprove}
          onStart={onStart}
          onClose={onClose}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
        />
      ))}
    </div>
  );
}

function BattleCard({
  battle,
  onApprove,
  onStart,
  onClose,
  getStatusColor,
  getStatusIcon
}: {
  battle: Battle;
  onApprove: (id: string) => void;
  onStart: (id: string) => void;
  onClose: (id: string, winnerId: string, deathOccurred: boolean) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
}) {
  const [showCloseModal, setShowCloseModal] = useState(false);

  const contestant1Display = battle.contestant_1_name 
    ? `${battle.contestant_1_name}${battle.contestant_1_nickname ? ` "${battle.contestant_1_nickname}"` : ''}`
    : `Contestant ${battle.contestant_1?.slice(-6)}`;
    
  const contestant2Display = battle.contestant_2_name 
    ? `${battle.contestant_2_name}${battle.contestant_2_nickname ? ` "${battle.contestant_2_nickname}"` : ''}`
    : `Contestant ${battle.contestant_2?.slice(-6)}`;

  const battleTitle = `${contestant1Display} vs ${contestant2Display}`;

  const dictatorInfo = battle.dictator_1_name && battle.dictator_2_name 
    ? `Dictadores: ${battle.dictator_1_name} vs ${battle.dictator_2_name}`
    : battle.dictator_1_name 
    ? `Dictador: ${battle.dictator_1_name}`
    : `Dictadores: ${battle.contestant_1?.slice(-6)} vs ${battle.contestant_2?.slice(-6)}`;

  const winnerDisplay = battle.winner_id 
    ? battle.winner_id === battle.contestant_1 
      ? contestant1Display 
      : contestant2Display
    : '';

  return (
    <>
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Sword className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {battleTitle}
              </h3>
              <p className="text-gray-400 text-sm">
                {dictatorInfo}
              </p>
              <p className="text-gray-500 text-xs">
                Propuesta: {new Date(battle.created_at || battle.proposed_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(battle.status)}`}>
            {getStatusIcon(battle.status)}
            {battle.status}
          </span>
        </div>

        {battle.winner_id && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-600 rounded">
            <p className="text-green-400 text-sm">
              Ganador: {winnerDisplay}
            </p>
          </div>
        )}

        {battle.death_occurred && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <Skull className="w-4 h-4" />
              Muerte ocurrida en esta batalla
            </p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            ID: {battle.id.slice(-8)}
          </div>
          
          <div className="flex gap-2">
            {battle.status === 'Pending' && (
              <button
                onClick={() => onApprove(battle.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Aprobar
              </button>
            )}

            {battle.status === 'Approved' && (
              <>
                <button
                  onClick={() => onStart(battle.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Iniciar
                </button>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalizar
                </button>
              </>
            )}

            {(battle.status === 'In Progress' || battle.status === 'Start') && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Finalizar
              </button>
            )}
          </div>
        </div>
      </div>

      {showCloseModal && (
        <CloseBattleModal
          battle={battle}
          contestant1Display={contestant1Display}
          contestant2Display={contestant2Display}
          onClose={() => setShowCloseModal(false)}
          onConfirm={(winnerId, deathOccurred) => {
            onClose(battle.id, winnerId, deathOccurred);
            setShowCloseModal(false);
          }}
        />
      )}
    </>
  );
}

function CloseBattleModal({
  battle,
  contestant1Display,
  contestant2Display,
  onClose,
  onConfirm
}: {
  battle: Battle;
  contestant1Display: string;
  contestant2Display: string;
  onClose: () => void;
  onConfirm: (winnerId: string, deathOccurred: boolean) => void;
}) {
  const [selectedWinner, setSelectedWinner] = useState('');
  const [deathOccurred, setDeathOccurred] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWinner) {
      onConfirm(selectedWinner, deathOccurred);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-red-600 mb-6">Finalizar Batalla</h3>
        
        <p className="text-gray-400 mb-4">
          Selecciona el ganador de la batalla:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-[#333] rounded cursor-pointer hover:border-[#444] transition-colors">
              <input
                type="radio"
                name="winner"
                value={battle.contestant_1}
                checked={selectedWinner === battle.contestant_1}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="text-red-600"
              />
              <span className="text-white">{contestant1Display}</span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-[#333] rounded cursor-pointer hover:border-[#444] transition-colors">
              <input
                type="radio"
                name="winner"
                value={battle.contestant_2}
                checked={selectedWinner === battle.contestant_2}
                onChange={(e) => setSelectedWinner(e.target.value)}
                className="text-red-600"
              />
              <span className="text-white">{contestant2Display}</span>
            </label>
          </div>

          <div className="border-t border-[#333] pt-4">
            <label className="flex items-center gap-3 p-3 border border-[#333] rounded cursor-pointer hover:border-[#444] transition-colors">
              <input
                type="checkbox"
                checked={deathOccurred}
                onChange={(e) => setDeathOccurred(e.target.checked)}
                className="text-red-600"
              />
              <div className="flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-400" />
                <span className="text-white">Ocurrió una muerte en esta batalla</span>
              </div>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedWinner}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              Finalizar Batalla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de notificación personalizado
function NotificationModal({
  message,
  type,
  onClose
}: {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'error': return <AlertTriangle className="w-8 h-8 text-red-400" />;
      case 'info': return <Info className="w-8 h-8 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-green-900/20 border-green-600 text-green-400';
      case 'error': return 'bg-red-900/20 border-red-600 text-red-400';
      case 'info': return 'bg-blue-900/20 border-blue-600 text-blue-400';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success': return 'Operación Exitosa';
      case 'error': return 'Error en la Operación';
      case 'info': return 'Información';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border ${getColors()}`}>
            {getIcon()}
          </div>
          
          <h3 className={`text-xl font-semibold mb-4 ${type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
            {getTitle()}
          </h3>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
