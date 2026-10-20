'use client';
import { useState, useEffect } from 'react';
import { Users, Crown, Gift, TrendingUp, Zap } from 'lucide-react';
import api from '@/lib/api';

interface Contestant {
  id: string;
  name: string;
  contestant_name: string;
  nickname: string;
  strength: number;
  agility: number;
  health: number;
  wins: number;
  losses: number;
  status: string;
  dictator_id: string;
  released: boolean;
  dictator_name?: string;
  dictator_username?: string;
}

interface Dictator {
  id: string;
  name: string;
  username: string;
  contestants: Contestant[];
}

interface InventoryItem {
  id: string;
  item_name: string; 
  description?: string;
  quantity: number;
  effect?: string;
  category: string; 
  sponsor_id: string;
}

export default function SponsorContestantsPage() {
  const [dictators, setDictators] = useState<Dictator[]>([]);
  const [allContestants, setAllContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'by-dictator' | 'all-contestants'>('by-dictator');
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  useEffect(() => {
    fetchContestantsData();
  }, []);

  const fetchContestantsData = async () => {
    try {
      const response = await api.get('/sponsor/contestants');
      
      if (Array.isArray(response.data)) {
        const mappedContestants = response.data.map((item: any, index: number) => ({
          id: item.id || `contestant_${index}`,
          name: item.name || 'Sin nombre real',
          contestant_name: item.contestant_name || 'Sin nombre contestant',
          nickname: item.nickname || '',
          strength: Number(item.strength) || 0,
          agility: Number(item.agility) || 0,
          health: Number(item.health) || 0,
          wins: Number(item.wins) || 0,
          losses: Number(item.losses) || 0,
          status: item.status || 'Active',
          dictator_id: item.dictator_id || '',
          released: Boolean(item.released) || false,
          dictator_name: item.dictator_name || 'Dictador Desconocido',
          dictator_username: item.dictator_username || 'sin_usuario'
        }));
        
        // Filtrar solo contestants no liberados
        const activeContestants = mappedContestants.filter(c => !c.released);
        
        setAllContestants(activeContestants);
        
        // Agrupar contestants por dictador
        const groupedByDictator = groupContestantsByDictator(activeContestants);
        setDictators(groupedByDictator);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAllContestants([]);
        setDictators([]);
        setError('');
      } else {
        setError(error.response?.data?.error || 'Error al cargar contestants');
      }
    } finally {
      setLoading(false);
    }
  };

  const groupContestantsByDictator = (contestants: Contestant[]): Dictator[] => {
    const dictatorMap = new Map<string, Dictator>();

    contestants.forEach(contestant => {
      const dictatorId = contestant.dictator_id;
      
      if (!dictatorMap.has(dictatorId)) {
        dictatorMap.set(dictatorId, {
          id: dictatorId,
          name: contestant.dictator_name || 'Dictador Desconocido',
          username: contestant.dictator_username || 'sin_usuario',
          contestants: []
        });
      }
      
      dictatorMap.get(dictatorId)!.contestants.push(contestant);
    });

    return Array.from(dictatorMap.values());
  };

  const handleSponsorContestant = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setShowSponsorModal(true);
  };

  const getContestantPower = (contestant: Contestant) => {
    return contestant.health + contestant.strength + contestant.agility;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'Injured': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'Dead': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'Training': return 'text-blue-400 bg-blue-900/20 border-blue-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  const getDisplayName = (contestant: Contestant): string => {
    if (contestant.name && contestant.name !== 'Sin nombre real') {
      return contestant.name;
    }
    if (contestant.contestant_name && contestant.contestant_name !== 'Sin nombre contestant') {
      return contestant.contestant_name;
    }
    return 'Sin nombre';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando contestants...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Contestants Disponibles
          </h1>
          <p className="text-gray-400">Encuentra y patrocina gladiadores prometedores</p>
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
            <span className="text-blue-400 font-semibold">Total Contestants</span>
          </div>
          <div className="text-2xl font-bold text-white">{allContestants.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Dictadores</span>
          </div>
          <div className="text-2xl font-bold text-white">{dictators.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Activos</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {allContestants.filter(c => c.status === 'Active').length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Poder Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {allContestants.length > 0 
              ? Math.round(allContestants.reduce((sum, c) => sum + getContestantPower(c), 0) / allContestants.length)
              : 0
            }
          </div>
        </div>
      </div>

      {/* Tabs de Vista */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg max-w-md">
          <button
            onClick={() => setViewMode('by-dictator')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'by-dictator'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Dictador
          </button>
          <button
            onClick={() => setViewMode('all-contestants')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'all-contestants'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos los Contestants
          </button>
        </div>
      </div>

      {/* Contenido según vista */}
      {allContestants.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No hay contestants disponibles
          </h3>
          <p className="text-gray-500">
            Los contestants aparecerán aquí cuando los dictadores los registren
          </p>
        </div>
      ) : viewMode === 'by-dictator' ? (
        <div className="space-y-8">
          {dictators.map((dictator) => (
            <DictatorSection
              key={dictator.id}
              dictator={dictator}
              onSponsorContestant={handleSponsorContestant}
              getContestantPower={getContestantPower}
              getStatusColor={getStatusColor}
              getDisplayName={getDisplayName}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allContestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              contestant={contestant}
              onSponsor={handleSponsorContestant}
              getContestantPower={getContestantPower}
              getStatusColor={getStatusColor}
              getDisplayName={getDisplayName}
              showDictator={true}
            />
          ))}
        </div>
      )}

      {/* Modal de Patrocinio */}
      {showSponsorModal && selectedContestant && (
        <SponsorModal
          contestant={selectedContestant}
          onClose={() => {
            setShowSponsorModal(false);
            setSelectedContestant(null);
          }}
          onSuccess={() => {
            setShowSponsorModal(false);
            setSelectedContestant(null);
            fetchContestantsData();
          }}
          getContestantPower={getContestantPower}
          getDisplayName={getDisplayName}
        />
      )}
    </div>
  );
}

// Componente para mostrar dictador y sus contestants
function DictatorSection({
  dictator,
  onSponsorContestant,
  getContestantPower,
  getStatusColor,
  getDisplayName
}: {
  dictator: Dictator;
  onSponsorContestant: (contestant: Contestant) => void;
  getContestantPower: (contestant: Contestant) => number;
  getStatusColor: (status: string) => string;
  getDisplayName: (contestant: Contestant) => string;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
      {/* Header del Dictador */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#333]">
        <Crown className="w-6 h-6 text-red-600" />
        <div>
          <h2 className="text-xl font-semibold text-red-600">{dictator.name}</h2>
        </div>
        <div className="ml-auto text-right">
          <div className="text-gray-400 text-sm">Contestants:</div>
          <div className="text-white font-bold">{dictator.contestants.length}</div>
        </div>
      </div>

      {/* Contestants del Dictador */}
      {dictator.contestants.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Este dictador no tiene contestants</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dictator.contestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              contestant={contestant}
              onSponsor={onSponsorContestant}
              getContestantPower={getContestantPower}
              getStatusColor={getStatusColor}
              getDisplayName={getDisplayName}
              showDictator={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de contestant
function ContestantCard({
  contestant,
  onSponsor,
  getContestantPower,
  getStatusColor,
  getDisplayName,
  showDictator
}: {
  contestant: Contestant;
  onSponsor: (contestant: Contestant) => void;
  getContestantPower: (contestant: Contestant) => number;
  getStatusColor: (status: string) => string;
  getDisplayName: (contestant: Contestant) => string;
  showDictator: boolean;
}) {
  const wins = Number(contestant.wins) || 0;
  const losses = Number(contestant.losses) || 0;
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-red-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          {/* Nombre principal arriba */}
          <h3 className="text-lg font-semibold text-white">
            {getDisplayName(contestant)}
          </h3>
          
          {/* Nickname abajo si existe */}
          {contestant.nickname && (
            <p className="text-gray-300 text-sm italic">"{contestant.nickname}"</p>
          )}
          
          {showDictator && (
            <p className="text-gray-400 text-sm mt-1">
              Dictador: {contestant.dictator_name}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(contestant.status)}`}>
          {contestant.status}
        </span>
      </div>

      {/* Estadísticas reales de la DB */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Salud:</span>
          <span className="text-red-400 font-bold">{contestant.health}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fuerza:</span>
          <span className="text-orange-400 font-bold">{contestant.strength}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Agilidad:</span>
          <span className="text-blue-400 font-bold">{contestant.agility}</span>
        </div>
      </div>

      {/* Resumen de poder */}
      <div className="mb-3 p-3 bg-[#0f0f0f] border border-[#444] rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400 text-sm">Poder Total:</span>
          <span className="text-yellow-400 font-bold">{getContestantPower(contestant)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Tasa Victoria:</span>
          <span className={`font-semibold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
            {winRate}%
          </span>
        </div>
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-green-400">Victorias: {wins}</span>
        <span className="text-red-400">Derrotas: {losses}</span>
      </div>

      {/* Estado de liberación */}
      {contestant.released && (
        <div className="mb-3 p-2 bg-gray-900/50 border border-gray-600 rounded">
          <span className="text-gray-400 text-xs">Contestant liberado</span>
        </div>
      )}

      {/* Botón de Patrocinar con color rojo pálido */}
      <div className="flex">
        <button
          onClick={() => onSponsor(contestant)}
          disabled={contestant.released || contestant.status === 'Dead'}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 disabled:bg-gray-600 text-white rounded transition-colors"
        >
          <Gift className="w-4 h-4" />
          {contestant.released ? 'No Disponible' : 'Patrocinar'}
        </button>
      </div>
    </div>
  );
}

// Modal de patrocinio
function SponsorModal({
  contestant,
  onClose,
  onSuccess,
  getContestantPower,
  getDisplayName
}: {
  contestant: Contestant;
  onClose: () => void;
  onSuccess: () => void;
  getContestantPower: (contestant: Contestant) => number;
  getDisplayName: (contestant: Contestant) => string;
}) {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [amount, setAmount] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/sponsor/inventory');
      
      // Mapear la estructura real del backend
      const mappedInventory = response.data.map((item: any) => ({
        id: item.id,
        item_name: item.item_name,
        description: item.description || '',
        quantity: Number(item.quantity) || 0,
        effect: item.effect || '',
        category: item.category,
        sponsor_id: item.sponsor_id
      }));
      
      setInventory(mappedInventory);
    } catch (error: any) {
      console.error('Error al cargar inventario:', error);
      if (error.response?.status === 404) {
        setInventory([]);
      } else {
        alert('Error al cargar tu inventario');
      }
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || amount < 1) return;

    setLoading(true);
    try {
      await api.post('/sponsor/sponsor-contestant', {
        contestant_id: contestant.id,
        item_id: selectedItemId,
        amount: amount
      });
      
      alert('Patrocinio realizado exitosamente');
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al patrocinar contestant');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = inventory.find(item => item.id === selectedItemId);
  const maxAmount = selectedItem?.quantity || 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-red-600 mb-6">Patrocinar Contestant</h3>
        
        <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold mb-1">
            {getDisplayName(contestant)}
          </h4>
          
          {contestant.nickname && (
            <p className="text-gray-300 text-sm italic mb-2">"{contestant.nickname}"</p>
          )}
          
          <p className="text-gray-400 text-sm">Dictador: {contestant.dictator_name}</p>
          
          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
            <div className="text-center">
              <div className="text-red-400 font-bold">{contestant.health}</div>
              <div className="text-gray-500">Salud</div>
            </div>
            <div className="text-center">
              <div className="text-orange-400 font-bold">{contestant.strength}</div>
              <div className="text-gray-500">Fuerza</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{contestant.agility}</div>
              <div className="text-gray-500">Agilidad</div>
            </div>
          </div>
          
          <p className="text-yellow-400 text-sm mt-2">
            Poder Total: {getContestantPower(contestant)}
          </p>
        </div>

        {loadingInventory ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Cargando tu inventario...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Selecciona un item de tu inventario:</label>
              {inventory.length === 0 ? (
                <div className="p-4 bg-gray-900/50 border border-gray-600 rounded text-center">
                  <p className="text-gray-400 text-sm">No tienes items en tu inventario</p>
                  <p className="text-gray-500 text-xs mt-1">Compra items en el Black Market primero</p>
                </div>
              ) : (
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    setAmount(1);
                  }}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona un item</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedItemId && (
              <div>
                <label className="block text-gray-400 mb-2">
                  Cantidad a donar (máximo: {maxAmount}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  required
                  disabled={loading}
                />
                
                {selectedItem && (
                  <div className="mt-2 p-3 bg-[#1a1a1a] border border-[#333] rounded">
                    <h5 className="text-white font-semibold text-sm mb-1">{selectedItem.item_name}</h5>
                    {selectedItem.description && (
                      <p className="text-gray-400 text-xs mb-2">{selectedItem.description}</p>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Tienes:</span>
                      <span className="text-white">{selectedItem.quantity} unidades</span>
                    </div>
                    {selectedItem.category && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Categoría:</span>
                        <span className="text-blue-400">{selectedItem.category}</span>
                      </div>
                    )}
                    {selectedItem.effect && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Efecto:</span>
                        <span className="text-green-400">{selectedItem.effect}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedItemId || amount < 1 || amount > maxAmount || inventory.length === 0}
                className="flex-1 px-4 py-2 bg-red-400 hover:bg-red-500 disabled:bg-gray-600 text-white rounded transition-colors"
              >
                {loading ? 'Patrocinando...' : `Donar ${amount} ${selectedItem?.item_name || 'item(s)'}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
