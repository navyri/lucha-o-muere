'use client';
import { useState, useEffect } from 'react';
import { Sword, Clock, CheckCircle, Users, Gift } from 'lucide-react';
import api from '@/lib/api';

interface Battle {
  id: string;
  date: string;
  contestant_1: string;
  contestant_2: string;
  winner_id: string | null;
  death_occurred: boolean;
  casualty_id: string | null;
  injuries: string | null;
  dictator_id: string;
  status: string;
}

interface Contestant {
  contestant_id: string;
  contestant_name: string;
  nickname: string;
  strength: number;
  agility: number;
  health: number;
  wins: number;
  losses: number;
  status: string;
  released: boolean;
  dictator_id: string;
  dictator_name: string;
  territory: string;
}

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  sponsor_id: string;
}

interface EnrichedBattle extends Battle {
  contestant_1_name: string;
  contestant_1_nickname: string;
  contestant_2_name: string;
  contestant_2_nickname: string;
  contestant_1_dictator: string;
  contestant_2_dictator: string;
}

export default function SponsorBatallasPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'live' | 'completed'>('active');
  const [battles, setBattles] = useState<EnrichedBattle[]>([]);
  const [filteredBattles, setFilteredBattles] = useState<EnrichedBattle[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [battles, activeTab]);

  const fetchData = async () => {
    try {
      const [battlesResponse, contestantsResponse, inventoryResponse] = await Promise.all([
        api.get('/sponsor/battles/active'),
        api.get('/sponsor/contestants'),
        api.get('/sponsor/inventory')
      ]);

      // ✅ Corrección: Manejar diferentes estructuras de respuesta
      let rawBattles = [];
      if (Array.isArray(battlesResponse.data)) {
        rawBattles = battlesResponse.data;
      } else if (battlesResponse.data && Array.isArray(battlesResponse.data.battles)) {
        rawBattles = battlesResponse.data.battles;
      } else if (battlesResponse.data && battlesResponse.data.message) {
        // Si no hay batallas, el backend puede devolver un mensaje
        rawBattles = [];
      } else {
        console.warn('Estructura de respuesta inesperada:', battlesResponse.data);
        rawBattles = [];
      }

      const contestants = contestantsResponse.data || [];

      console.log('Batallas recibidas:', rawBattles.length);
      console.log('Estructura de respuesta de batallas:', battlesResponse.data);
      console.log('Contestants recibidos:', contestants.length);

      // Crear mapa de contestants para búsqueda rápida
      const contestantMap = new Map();
      contestants.forEach((contestant: Contestant) => {
        contestantMap.set(contestant.contestant_id, {
          name: contestant.contestant_name,
          nickname: contestant.nickname,
          dictatorName: contestant.dictator_name,
          strength: contestant.strength,
          agility: contestant.agility,
          health: contestant.health,
          wins: contestant.wins,
          losses: contestant.losses,
          status: contestant.status
        });
      });

      // Enriquecer batallas con datos de contestants
      const enrichedBattles: EnrichedBattle[] = rawBattles.map((battle: Battle) => {
        const contestant1Info = contestantMap.get(battle.contestant_1) || {
          name: `Contestant ${battle.contestant_1?.slice(-6)}`,
          nickname: '',
          dictatorName: 'Dictador Desconocido'
        };
        
        const contestant2Info = contestantMap.get(battle.contestant_2) || {
          name: `Contestant ${battle.contestant_2?.slice(-6)}`,
          nickname: '',
          dictatorName: 'Dictador Desconocido'
        };

        return {
          ...battle,
          contestant_1_name: contestant1Info.name,
          contestant_1_nickname: contestant1Info.nickname,
          contestant_2_name: contestant2Info.name,
          contestant_2_nickname: contestant2Info.nickname,
          contestant_1_dictator: contestant1Info.dictatorName,
          contestant_2_dictator: contestant2Info.dictatorName
        };
      });

      console.log('Batallas enriquecidas:', enrichedBattles);
      setBattles(enrichedBattles);

      // Mapear inventario
      const mappedInventory = (inventoryResponse.data || []).map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        category: item.category,
        quantity: Number(item.quantity) || 0,
        sponsor_id: item.sponsor_id
      }));
      setInventory(mappedInventory);

    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      console.error('Detalles del error:', error.response?.data);
      setError(error.response?.data?.error || 'Error al cargar batallas');
      
      // ✅ En caso de error, asegurar arrays vacíos
      setBattles([]);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...battles];

    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(battle => 
          battle.status === 'Approved' || 
          battle.status === 'Pending' || 
          battle.status === 'Scheduled'
        );
        break;
      case 'live':
        filtered = filtered.filter(battle => 
          battle.status === 'In Progress' || 
          battle.status === 'Active' || 
          battle.status === 'Ongoing'
        );
        break;
      case 'completed':
        filtered = filtered.filter(battle => 
          battle.status === 'Completed' || 
          battle.status === 'Finished' ||
          battle.winner_id !== null
        );
        break;
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    
    setFilteredBattles(filtered);
  };

  // Función corregida con todos los parámetros
  const handleApplyBuff = async (battleId: string, contestantId: string, itemName: string, strengthBoost: number, agilityBoost: number, duration: number) => {
    try {
      await api.post('/sponsor/apply-buff/battle', {
        battleId: battleId,
        contestantId: contestantId,
        item_name: itemName,
        strength_boost: strengthBoost,
        agility_boost: agilityBoost,
        duration: duration
      });
      
      alert(`Buff aplicado: ${itemName} (+${strengthBoost} fuerza, +${agilityBoost} agilidad, ${duration} turnos)`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aplicar buff');
    }
  };

  const handleGiveItem = async (contestantId: string, itemName: string) => {
    try {
      await api.post('/sponsor/give-item', {
        contestantId: contestantId,
        itemName: itemName
      });
      
      alert(`Arma donada: ${itemName}`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al donar arma');
    }
  };

  const getActiveBattles = () => battles.filter(b => 
    b.status === 'Approved' || b.status === 'Pending' || b.status === 'Scheduled'
  );
  const getLiveBattles = () => battles.filter(b => 
    b.status === 'In Progress' || b.status === 'Active' || b.status === 'Ongoing'
  );
  const getCompletedBattles = () => battles.filter(b => 
    b.status === 'Completed' || b.status === 'Finished' || b.winner_id !== null
  );

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
            Centro de Batallas
          </h1>
          <p className="text-gray-400">Patrocina gladiadores y apoya en batallas en vivo</p>
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
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Próximas</span>
          </div>
          <div className="text-2xl font-bold text-white">{getActiveBattles().length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sword className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">En Vivo</span>
          </div>
          <div className="text-2xl font-bold text-white">{getLiveBattles().length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 font-semibold">Completadas</span>
          </div>
          <div className="text-2xl font-bold text-white">{getCompletedBattles().length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Items Disponibles</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {inventory.filter(item => item.quantity > 0).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Próximas Batallas ({getActiveBattles().length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'live'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            En Vivo ({getLiveBattles().length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'completed'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Completadas ({getCompletedBattles().length})
          </button>
        </div>
      </div>

      {/* Contenido */}
      {filteredBattles.length === 0 ? (
        <div className="text-center py-12">
          <Sword className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No hay batallas {activeTab === 'active' ? 'próximas' : activeTab === 'live' ? 'en vivo' : 'completadas'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'active' 
              ? 'Las batallas aparecerán aquí cuando sean aprobadas'
              : activeTab === 'live'
              ? 'Las batallas en vivo aparecerán aquí'
              : 'El historial de batallas aparecerá aquí'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBattles.map((battle) => (
            <SponsorBattleCard
              key={battle.id}
              battle={battle}
              inventory={inventory}
              onApplyBuff={handleApplyBuff}
              onGiveItem={handleGiveItem}
              isLive={activeTab === 'live'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de batalla con signatura corregida
function SponsorBattleCard({
  battle,
  inventory,
  onApplyBuff,
  onGiveItem,
  isLive
}: {
  battle: EnrichedBattle;
  inventory: InventoryItem[];
  onApplyBuff: (battleId: string, contestantId: string, itemName: string, strengthBoost: number, agilityBoost: number, duration: number) => void;
  onGiveItem: (contestantId: string, itemName: string) => void;
  isLive: boolean;
}) {
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<{id: string, name: string, nickname: string}>({id: '', name: '', nickname: ''});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Pending':
      case 'Scheduled': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'In Progress':
      case 'Active':
      case 'Ongoing': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'Completed':
      case 'Finished': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Pending':
      case 'Scheduled': return 'Próximamente';
      case 'In Progress':
      case 'Active':
      case 'Ongoing': return 'EN VIVO';
      case 'Completed':
      case 'Finished': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <>
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {battle.contestant_1_name} vs {battle.contestant_2_name}
            </h3>
            <p className="text-gray-400 text-sm mb-1">
              Dictadores: {battle.contestant_1_dictator} vs {battle.contestant_2_dictator}
            </p>
            <p className="text-gray-500 text-xs">
              {isLive ? 'Batalla en curso' : `Fecha: ${new Date(battle.date).toLocaleDateString()}`}
            </p>
            
            <div className="mt-2 space-y-1 text-xs">
              {battle.death_occurred && (
                <div className="text-red-400">Muerte ocurrida en esta batalla</div>
              )}
              {battle.injuries && (
                <div className="text-yellow-400">Heridas: {battle.injuries}</div>
              )}
              {battle.casualty_id && (
                <div className="text-red-400">Baja: {battle.casualty_id.slice(-6)}</div>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(battle.status)}`}>
            {isLive && <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>}
            {getStatusText(battle.status)}
          </span>
        </div>

        {/* Contestants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Contestant 1 */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {battle.contestant_1_name}
            </h4>
            <div className="space-y-2 mb-4">
              {battle.contestant_1_nickname && (
                <div className="text-xs text-gray-300 italic">"{battle.contestant_1_nickname}"</div>
              )}
              <div className="text-xs text-gray-400">
                Dictador: {battle.contestant_1_dictator}
              </div>
              <div className="text-xs text-gray-500">
                ID: {battle.contestant_1.slice(-8)}
              </div>
              {battle.winner_id === battle.contestant_1 && (
                <div className="text-xs text-green-400 font-bold">GANADOR</div>
              )}
              {battle.casualty_id === battle.contestant_1 && (
                <div className="text-xs text-red-400 font-bold">CAÍDO</div>
              )}
            </div>
            {(isLive || battle.status === 'Approved' || battle.status === 'Pending') && (
              <button
                onClick={() => {
                  setSelectedContestant({
                    id: battle.contestant_1, 
                    name: battle.contestant_1_name,
                    nickname: battle.contestant_1_nickname
                  });
                  setShowSponsorModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                <Gift className="w-3 h-3" />
                Patrocinar
              </button>
            )}
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className={`bg-[#1a1a1a] border border-[#333] rounded-full w-16 h-16 flex items-center justify-center ${
              isLive ? 'animate-pulse' : ''
            }`}>
              <span className="text-red-600 font-bold text-xl">VS</span>
            </div>
          </div>

          {/* Contestant 2 */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {battle.contestant_2_name}
            </h4>
            <div className="space-y-2 mb-4">
              {battle.contestant_2_nickname && (
                <div className="text-xs text-gray-300 italic">"{battle.contestant_2_nickname}"</div>
              )}
              <div className="text-xs text-gray-400">
                Dictador: {battle.contestant_2_dictator}
              </div>
              <div className="text-xs text-gray-500">
                ID: {battle.contestant_2.slice(-8)}
              </div>
              {battle.winner_id === battle.contestant_2 && (
                <div className="text-xs text-green-400 font-bold">GANADOR</div>
              )}
              {battle.casualty_id === battle.contestant_2 && (
                <div className="text-xs text-red-400 font-bold">CAÍDO</div>
              )}
            </div>
            {(isLive || battle.status === 'Approved' || battle.status === 'Pending') && (
              <button
                onClick={() => {
                  setSelectedContestant({
                    id: battle.contestant_2, 
                    name: battle.contestant_2_name,
                    nickname: battle.contestant_2_nickname
                  });
                  setShowSponsorModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                <Gift className="w-3 h-3" />
                Patrocinar
              </button>
            )}
          </div>
        </div>

        {/* Winner info for completed battles */}
        {battle.winner_id && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-600 rounded">
            <p className="text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Ganador: {battle.winner_id === battle.contestant_1 ? battle.contestant_1_name : battle.contestant_2_name}
            </p>
          </div>
        )}

        {/* Info de la batalla */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Batalla ID: {battle.id.slice(-8)}
          </div>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              Batalla en vivo
            </div>
          )}
        </div>
      </div>

      {/* Modal de patrocinio */}
      {showSponsorModal && (
        <SponsorModal
          isOpen={showSponsorModal}
          onClose={() => {
            setShowSponsorModal(false);
            setSelectedContestant({id: '', name: '', nickname: ''});
          }}
          contestantId={selectedContestant.id}
          contestantName={selectedContestant.name}
          contestantNickname={selectedContestant.nickname}
          battleId={battle.id}
          inventory={inventory}
          onApplyBuff={onApplyBuff}
          onGiveItem={onGiveItem}
          isLive={isLive}
        />
      )}
    </>
  );
}

// Modal de patrocinio con signatura corregida
function SponsorModal({
  isOpen,
  onClose,
  contestantId,
  contestantName,
  contestantNickname,
  battleId,
  inventory,
  onApplyBuff,
  onGiveItem,
  isLive
}: {
  isOpen: boolean;
  onClose: () => void;
  contestantId: string;
  contestantName: string;
  contestantNickname: string;
  battleId: string;
  inventory: InventoryItem[];
  onApplyBuff: (battleId: string, contestantId: string, itemName: string, strengthBoost: number, agilityBoost: number, duration: number) => void;
  onGiveItem: (contestantId: string, itemName: string) => void;
  isLive: boolean;
}) {
  const [activeAction, setActiveAction] = useState<'item' | 'buff'>('item');
  const [selectedWeapon, setSelectedWeapon] = useState('');
  const [selectedBuffItem, setSelectedBuffItem] = useState('');
  
  // Estados para buff con duración incluida
  const [strengthBoost, setStrengthBoost] = useState(10);
  const [agilityBoost, setAgilityBoost] = useState(10);
  const [duration, setDuration] = useState(5);

  const availableWeapons = inventory.filter(item => 
    item.quantity > 0 && item.category === 'weapon'
  );
  
  const availableBuffItems = inventory.filter(item => 
    item.quantity > 0 && item.category === 'buff'
  );

  const handleGiveWeapon = () => {
    if (!selectedWeapon) return;
    onGiveItem(contestantId, selectedWeapon);
    onClose();
  };

  const handleApplyBuff = () => {
    if (!selectedBuffItem) return;
    // Incluir todos los parámetros incluyendo duration
    onApplyBuff(battleId, contestantId, selectedBuffItem, strengthBoost, agilityBoost, duration);
    onClose();
  };

  const resetForm = () => {
    setSelectedWeapon('');
    setSelectedBuffItem('');
    setStrengthBoost(10);
    setAgilityBoost(10);
    setDuration(5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-red-600 mb-6">
          Patrocinar a {contestantName}
        </h3>

        <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold">{contestantName}</h4>
          {contestantNickname && (
            <p className="text-gray-300 text-sm italic">"{contestantNickname}"</p>
          )}
          <p className="text-gray-400 text-sm mt-2">
            {isLive ? '🔴 Batalla en vivo - Los efectos se aplicarán inmediatamente' : '⏳ Batalla próxima - Los items estarán disponibles al inicio'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded">
            <button
              onClick={() => {
                setActiveAction('item');
                resetForm();
              }}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                activeAction === 'item'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dar Arma
            </button>
            <button
              onClick={() => {
                setActiveAction('buff');
                resetForm();
              }}
              className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                activeAction === 'buff'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Aplicar Buff
            </button>
          </div>
        </div>

        {/* Content */}
        {activeAction === 'item' ? (
          <div className="space-y-4">
            <label className="block text-gray-400 mb-2">Seleccionar Arma</label>
            <p className="text-yellow-400 text-xs mb-3">Solo se pueden donar armas (categoría 'weapon')</p>
            
            {availableWeapons.length === 0 ? (
              <div className="p-4 bg-gray-900/20 border border-gray-600 rounded text-center">
                <p className="text-gray-400">No tienes armas disponibles</p>
                <p className="text-gray-500 text-xs mt-1">Solo items de categoría 'weapon' se pueden donar</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableWeapons.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 p-3 border border-[#333] rounded cursor-pointer hover:border-[#444] transition-colors"
                  >
                    <input
                      type="radio"
                      name="weapon"
                      value={item.item_name}
                      checked={selectedWeapon === item.item_name}
                      onChange={(e) => setSelectedWeapon(e.target.value)}
                      className="text-red-600"
                    />
                    <div className="flex-1">
                      <span className="text-white">{item.item_name}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({item.quantity} disponibles)
                      </span>
                      <div className="text-xs text-orange-400">
                        🗡️ Arma
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <label className="block text-gray-400 mb-2">Seleccionar Item de Buff</label>
            <p className="text-yellow-400 text-xs mb-3">Solo items de categoría 'buff' pueden aplicarse</p>
            
            {availableBuffItems.length === 0 ? (
              <div className="p-4 bg-gray-900/20 border border-gray-600 rounded text-center">
                <p className="text-gray-400">No tienes buffs disponibles</p>
                <p className="text-gray-500 text-xs mt-1">Solo items de categoría 'buff' aparecerán aquí</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                  {availableBuffItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 border border-[#333] rounded cursor-pointer hover:border-[#444] transition-colors"
                    >
                      <input
                        type="radio"
                        name="buffItem"
                        value={item.item_name}
                        checked={selectedBuffItem === item.item_name}
                        onChange={(e) => setSelectedBuffItem(e.target.value)}
                        className="text-red-600"
                      />
                      <div className="flex-1">
                        <span className="text-white">{item.item_name}</span>
                        <span className="text-gray-400 text-sm ml-2">
                          ({item.quantity} disponibles)
                        </span>
                        <div className="text-xs text-green-400">
                          ⚡ Buff
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Configuración de buff con duración */}
                {selectedBuffItem && (
                  <div className="border border-[#333] rounded p-4 bg-[#1a1a1a]">
                    <h5 className="text-white font-semibold mb-3">Configurar Efectos del Buff</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Boost de Fuerza: +{strengthBoost}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={strengthBoost}
                          onChange={(e) => setStrengthBoost(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>+50</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Boost de Agilidad: +{agilityBoost}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={agilityBoost}
                          onChange={(e) => setAgilityBoost(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>+50</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm mb-1">
                          Duración: {duration} turnos
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1 turno</span>
                          <span>20 turnos</span>
                        </div>
                      </div>

                      {/* Preview del buff */}
                      <div className="p-3 bg-[#0f0f0f] border border-[#444] rounded">
                        <h6 className="text-green-400 font-semibold text-sm mb-2">Vista Previa del Buff:</h6>
                        <div className="text-xs space-y-1">
                          <div className="text-white">Item: {selectedBuffItem}</div>
                          <div className="text-orange-400">Fuerza: +{strengthBoost}</div>
                          <div className="text-blue-400">Agilidad: +{agilityBoost}</div>
                          <div className="text-purple-400">Duración: {duration} turnos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={activeAction === 'item' ? handleGiveWeapon : handleApplyBuff}
            disabled={
              activeAction === 'item' 
                ? !selectedWeapon 
                : !selectedBuffItem
            }
            className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {activeAction === 'item' 
              ? `Donar ${selectedWeapon || 'Arma'}` 
              : `Aplicar Buff (+${strengthBoost}/${agilityBoost}/${duration}t)`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
