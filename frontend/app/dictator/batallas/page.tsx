'use client';
import { useState, useEffect } from 'react';
import { Sword, Users, CheckCircle, X } from 'lucide-react';
import api from '@/lib/api';

interface Opponent {
  id: string;
  name: string;
  nickname?: string;
  health: number;
  strength: number;
  agility: number;
  wins: number;
  losses: number;
  status: 'Alive' | 'Injured' | 'Dead';
  dictator_name: string;
  dictator_id: string;
}

interface MyContestant {
  id: string;
  name: string;
  nickname?: string;
  health: number;
  strength: number;
  agility: number;
  wins: number;
  losses: number;
  status: 'Alive' | 'Injured' | 'Dead';
}

// Funciones helper para evitar NaN y valores undefined
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const generateUniqueKey = (opponent: Opponent, index: number): string => {
  return opponent.id || `opponent-${index}-${opponent.name || 'unknown'}`;
};

export default function DictatorBatallasPage() {
  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

  useEffect(() => {
    fetchOpponents();
  }, []);

  const fetchOpponents = async () => {
    try {
      const response = await api.get('/dictator/available-opponents');

      const mappedOpponents = response.data.map((opponent: any, index: number) => ({
        id: opponent.contestant_id || `temp-${index}`,
        name: opponent.contestant_name || 'Sin nombre',
        nickname: opponent.nickname || '',
        health: safeNumber(opponent.health) || 100,
        strength: safeNumber(opponent.strength),
        agility: safeNumber(opponent.agility),
        wins: safeNumber(opponent.wins) || 0,
        losses: safeNumber(opponent.losses) || 0,
        status: 'Alive' as const,
        dictator_name: opponent.dictator_name || 'Anónimo',
        dictator_id: opponent.dictator_id || ''
      }));

      setOpponents(mappedOpponents);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setOpponents([]);
        setError('');
      } else {
        setError(error.response?.data?.error || 'Error al cargar oponentes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProposeBattle = (opponent: Opponent) => {
    setSelectedOpponent(opponent);
    setShowProposeModal(true);
  };

  const getTotalPower = (contestant: Opponent | MyContestant): number => {
    const health = safeNumber(contestant.health);
    const strength = safeNumber(contestant.strength);
    const agility = safeNumber(contestant.agility);
    return health + strength + agility;
  };

  const getWinRate = (contestant: Opponent): number => {
    const wins = safeNumber(contestant.wins);
    const losses = safeNumber(contestant.losses);
    const totalBattles = wins + losses;
    if (totalBattles === 0) return 0;
    const rate = Math.round((wins / totalBattles) * 100);
    return isNaN(rate) ? 0 : rate;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Alive': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'Injured': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'Dead': return 'text-red-400 bg-red-900/20 border-red-600';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando oponentes disponibles...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Sword className="w-8 h-8" />
            Arena de Combate
          </h1>
          <p className="text-gray-400">Encuentra oponentes dignos y propón combates épicos</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Gladiadores Disponibles</span>
          </div>
          <div className="text-2xl font-bold text-white">{opponents.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sword className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Gladiadores Vivos</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {opponents.filter(o => o.status === 'Alive').length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Con Experiencia</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {opponents.filter(o => (safeNumber(o.wins) + safeNumber(o.losses)) > 0).length}
          </div>
        </div>
      </div>

      {opponents.length === 0 ? (
        <div className="text-center py-12">
          <Sword className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No hay gladiadores disponibles</h3>
          <p className="text-gray-500">No hay oponentes disponibles para combatir en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opponents.map((opponent, index) => {
            const uniqueKey = generateUniqueKey(opponent, index);
            
            return (
              <div key={uniqueKey} className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-red-600 mb-1">
                      {opponent.name || 'Sin nombre'}
                    </h3>
                    {opponent.nickname && (
                      <p className="text-gray-300 text-sm italic mb-1">"{opponent.nickname}"</p>
                    )}
                    <p className="text-gray-400 text-xs">
                      Dictador: {opponent.dictator_name || 'Anónimo'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-lg">
                      {getTotalPower(opponent)}
                    </div>
                    <div className="text-xs text-gray-400">Poder Total</div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(opponent.status)}`}>
                    {opponent.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                  <div className="text-center p-2 bg-[#1a1a1a] rounded">
                    <div className="text-green-400 font-bold">{safeNumber(opponent.health)}</div>
                    <div className="text-xs text-gray-400">Salud</div>
                  </div>
                  <div className="text-center p-2 bg-[#1a1a1a] rounded">
                    <div className="text-red-400 font-bold">{safeNumber(opponent.strength)}</div>
                    <div className="text-xs text-gray-400">Fuerza</div>
                  </div>
                  <div className="text-center p-2 bg-[#1a1a1a] rounded">
                    <div className="text-blue-400 font-bold">{safeNumber(opponent.agility)}</div>
                    <div className="text-xs text-gray-400">Agilidad</div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333] rounded">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{safeNumber(opponent.wins)}</div>
                      <div className="text-xs text-gray-400">Victorias</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${getWinRate(opponent) >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {getWinRate(opponent)}%
                      </div>
                      <div className="text-xs text-gray-400">Éxito</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 font-bold">{safeNumber(opponent.losses)}</div>
                      <div className="text-xs text-gray-400">Derrotas</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleProposeBattle(opponent)}
                  disabled={opponent.status !== 'Alive'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors font-semibold"
                >
                  <Sword className="w-4 h-4" />
                  {opponent.status !== 'Alive' ? 'No Disponible' : 'Desafiar'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showProposeModal && selectedOpponent && (
        <ProposeBattleModal
          opponent={selectedOpponent}
          onClose={() => {
            setShowProposeModal(false);
            setSelectedOpponent(null);
          }}
          onSuccess={() => {
            setShowProposeModal(false);
            setSelectedOpponent(null);
            fetchOpponents();
          }}
          getTotalPower={getTotalPower}
        />
      )}
    </div>
  );
}

// Modal para proponer batalla
function ProposeBattleModal({
  opponent,
  onClose,
  onSuccess,
  getTotalPower
}: {
  opponent: Opponent;
  onClose: () => void;
  onSuccess: () => void;
  getTotalPower: (contestant: any) => number;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState('');
  const [myContestants, setMyContestants] = useState<MyContestant[]>([]);
  const [loadingContestants, setLoadingContestants] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMyContestants();
  }, []);

  const fetchMyContestants = async () => {
    try {
      const response = await api.get('/dictator/contestants');

      const aliveContestants = response.data
        .filter((contestant: any) => contestant.status === 'Alive')
        .map((contestant: any) => ({
          id: contestant.id,
          name: contestant.name || 'Sin nombre',
          nickname: contestant.nickname,
          health: safeNumber(contestant.health),
          strength: safeNumber(contestant.strength),
          agility: safeNumber(contestant.agility),
          wins: safeNumber(contestant.wins),
          losses: safeNumber(contestant.losses),
          status: contestant.status || 'Alive'
        }));

      setMyContestants(aliveContestants);
    } catch (error) {
      console.error('Error al cargar contestants:', error);
    } finally {
      setLoadingContestants(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestant) return;

    setLoading(true);
    try {
      await api.post('/dictator/propose-battle', {
        contestant1: selectedContestant,
        contestant2: opponent.id
      });

      setSuccessMessage(`¡Batalla propuesta exitosamente! Tu gladiador se enfrentará a ${opponent.name} en la arena.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setSuccessMessage(`Error al proponer batalla: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const selectedContestantData = myContestants.find(c => c.id === selectedContestant);
  const opponentPower = getTotalPower(opponent);
  const myPower = selectedContestantData ? getTotalPower(selectedContestantData) : 0;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-red-600">Proponer Batalla</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#333] rounded">
            <h4 className="text-white font-semibold mb-2">Oponente:</h4>
            <p className="text-red-400">{opponent.name}</p>
            {opponent.nickname && <p className="text-gray-300 text-sm italic">"{opponent.nickname}"</p>}
            <p className="text-gray-400 text-sm">Dictador: {opponent.dictator_name}</p>
            <p className="text-yellow-400 text-sm">Poder: {opponentPower}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Selecciona tu Contestant:</label>
              {loadingContestants ? (
                <div className="text-gray-400 text-center py-4">Cargando contestants...</div>
              ) : myContestants.length === 0 ? (
                <div className="text-gray-400 text-center py-4">No tienes contestants vivos disponibles para batalla</div>
              ) : (
                <select
                  value={selectedContestant}
                  onChange={(e) => setSelectedContestant(e.target.value)}
                  className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona un contestant</option>
                  {myContestants.map((contestant) => (
                    <option key={contestant.id} value={contestant.id}>
                      {contestant.name} (Poder: {getTotalPower(contestant)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedContestantData && (
              <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded">
                <h4 className="text-white font-semibold mb-2">Tu Contestant:</h4>
                <p className="text-blue-400">{selectedContestantData.name}</p>
                {selectedContestantData.nickname && (
                  <p className="text-gray-300 text-sm italic">"{selectedContestantData.nickname}"</p>
                )}
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div>Salud: {safeNumber(selectedContestantData.health)}</div>
                  <div>Fuerza: {safeNumber(selectedContestantData.strength)}</div>
                  <div>Agilidad: {safeNumber(selectedContestantData.agility)}</div>
                </div>
                <p className="text-gray-400 text-sm mt-1">Poder Total: {safeNumber(myPower)}</p>
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
                disabled={loading || !selectedContestant || myContestants.length === 0}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors font-semibold"
              >
                {loading ? 'Proponiendo...' : '⚔️ Proponer Batalla'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
            onSuccess();
          }}
        />
      )}
    </>
  );
}

// Modal de éxito/error
function SuccessModal({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  const isError = message.toLowerCase().includes('error');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isError ? 'bg-red-900/20 border border-red-600' : 'bg-green-900/20 border border-green-600'
          }`}>
            {isError ? (
              <X className="w-8 h-8 text-red-400" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-400" />
            )}
          </div>

          <h3 className={`text-xl font-semibold mb-4 ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {isError ? 'Error en la Propuesta' : '⚔️ Batalla Propuesta'}
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
