'use client';
import { useState, useEffect } from 'react';
import { Sword, Clock, CheckCircle, Users, DollarSign, TrendingUp, Target, Plus, X, AlertTriangle, Info } from 'lucide-react';
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
  contestant_id?: string;
  id?: string;
  contestant_name?: string;
  name?: string;
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

interface EnrichedBattle extends Battle {
  contestant_1_name: string;
  contestant_1_nickname: string;
  contestant_2_name: string;
  contestant_2_nickname: string;
  contestant_1_dictator: string;
  contestant_2_dictator: string;
  can_bet: boolean;
  is_own_battle: boolean;
}

interface MyBet {
  id: string;
  battle_id: string;
  bettor_id: string;
  bettor_type: string;
  amount: number;
  predicted_winner: string;
  bet_date: string;
  status: string;
  payout: number;
  battle_status: string;
  battle_winner: string;
  battle_date: string;
}

export default function DictatorApuestasPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my-bets' | 'history'>('available');
  const [battles, setBattles] = useState<EnrichedBattle[]>([]);
  const [myBets, setMyBets] = useState<MyBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<EnrichedBattle | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentDictatorId, setCurrentDictatorId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let currentDictator = '';
      try {
        const profileResponse = await api.get('/dictator/contestants');
        if (profileResponse.data.length > 0) {
          currentDictator = profileResponse.data[0].dictator_id;
          setCurrentDictatorId(currentDictator);
        }
      } catch (profileError) {
        // Silently handle profile error
      }
      
      // ✅ Corrección: Manejar diferentes estructuras de respuesta para batallas
      let rawBattles = [];
      try {
        const battlesResponse = await api.get('/dictator/battles/active');
        
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
      } catch (battlesError) {
        console.error('Error cargando batallas:', battlesError);
        setError('Error al cargar batallas. Mostrando datos limitados.');
        rawBattles = [];
      }
      
      let allContestants: any[] = [];
      try {
        const myContestantsResponse = await api.get('/dictator/contestants');
        const myContestants = myContestantsResponse.data || [];
        
        const opponentsResponse = await api.get('/dictator/available-opponents');
        const opponents = opponentsResponse.data || [];
        
        allContestants = [...myContestants, ...opponents];
        
      } catch (contestantsError) {
        // Silently handle contestants error
      }

      const contestantMap = new Map();
      allContestants.forEach((contestant: Contestant) => {
        if (contestant && (contestant.contestant_id || contestant.id)) {
          const contestantId = contestant.contestant_id || contestant.id;
          const contestantName = contestant.contestant_name || contestant.name;
          const dictatorName = contestant.dictator_name;
          const dictatorId = contestant.dictator_id;
          
          contestantMap.set(contestantId, {
            contestant_id: contestantId,
            contestant_name: contestantName,
            nickname: contestant.nickname,
            dictator_name: dictatorName,
            dictator_id: dictatorId,
            strength: contestant.strength,
            agility: contestant.agility,
            health: contestant.health,
            wins: contestant.wins,
            losses: contestant.losses,
            status: contestant.status
          });
        }
      });

      const enrichedBattles: EnrichedBattle[] = rawBattles.map((battle: Battle) => {
        const contestant1Info = contestantMap.get(battle.contestant_1);
        const contestant2Info = contestantMap.get(battle.contestant_2);

        const contestant1BelongsToMe = contestant1Info?.dictator_id === currentDictator;
        const contestant2BelongsToMe = contestant2Info?.dictator_id === currentDictator;
        const isOwnBattle = contestant1BelongsToMe || contestant2BelongsToMe;
        const canBet = !isOwnBattle;

        return {
          ...battle,
          contestant_1_name: contestant1Info?.contestant_name || 
                            `Gladiador ${battle.contestant_1?.slice(-6) || 'Desconocido'}`,
          contestant_1_nickname: contestant1Info?.nickname || '',
          contestant_1_dictator: contestant1Info?.dictator_name || 'Dictador Desconocido',
          
          contestant_2_name: contestant2Info?.contestant_name || 
                            `Gladiador ${battle.contestant_2?.slice(-6) || 'Desconocido'}`,
          contestant_2_nickname: contestant2Info?.nickname || '',
          contestant_2_dictator: contestant2Info?.dictator_name || 'Dictador Desconocido',
          
          can_bet: canBet,
          is_own_battle: isOwnBattle
        };
      });

      setBattles(enrichedBattles);

      try {
        const betsResponse = await api.get('/dictator/my-bets');
        setMyBets(betsResponse.data.bets || []);
      } catch (betsError) {
        setMyBets([]);
      }

    } catch (error: any) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar datos. Algunas funciones pueden estar limitadas.');
      setBattles([]);
      setMyBets([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async (battleId: string, contestantId: string, amount: number) => {
    try {
      await api.post('/dictator/place-bet', {
        battleId: battleId,
        predictedWinner: contestantId,
        amount: amount           
      });
      setSuccessMessage('Apuesta realizada exitosamente');
      setShowSuccessModal(true);
      fetchData();
    } catch (error: any) {
      setSuccessMessage(`Error al realizar apuesta: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    }
  };

  const getAvailableBattles = () => battles.filter(b => 
    b.status === 'Approved' && !b.winner_id
  );

  const getActiveBets = () => myBets.filter(bet => 
    !bet.status || bet.status === 'pending' || bet.status === 'active'
  );

  const getCompletedBets = () => myBets.filter(bet => 
    bet.status === 'Won' || bet.status === 'Lost' || bet.status === 'Closed'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando sistema de apuestas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Sistema de Apuestas
          </h1>
          <p className="text-gray-400">Apuesta por gladiadores en batallas épicas</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded text-yellow-400">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Batallas Disponibles</span>
          </div>
          <div className="text-2xl font-bold text-white">{getAvailableBattles().length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Puedo Apostar</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {getAvailableBattles().filter(b => b.can_bet).length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Mis Batallas</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {getAvailableBattles().filter(b => b.is_own_battle).length}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Total Apostado</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${myBets.reduce((sum, bet) => sum + Number(bet.amount), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-[#1a1a1a] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'available'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Batallas Disponibles ({getAvailableBattles().length})
          </button>
          <button
            onClick={() => setActiveTab('my-bets')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'my-bets'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Mis Apuestas ({getActiveBets().length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Historial ({getCompletedBets().length})
          </button>
        </div>
      </div>

      {/* Contenido */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {getAvailableBattles().length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No hay batallas disponibles
              </h3>
              <p className="text-gray-500">
                Las batallas aparecerán aquí cuando sean aprobadas
              </p>
            </div>
          ) : (
            getAvailableBattles().map((battle, index) => (
              <BattleCard
                key={`battle-${battle.id}-${index}`}
                battle={battle}
                onPlaceBet={(contestantId) => {
                  setSelectedBattle(battle);
                  setShowBetModal(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'my-bets' && (
        <div className="space-y-4">
          {getActiveBets().length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No tienes apuestas activas
              </h3>
            </div>
          ) : (
            getActiveBets().map((bet, index) => (
              <BetCard key={`bet-${bet.id}-${index}`} bet={bet} />
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {getCompletedBets().length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No tienes historial de apuestas
              </h3>
            </div>
          ) : (
            getCompletedBets().map((bet, index) => (
              <BetCard key={`history-bet-${bet.id}-${index}`} bet={bet} />
            ))
          )}
        </div>
      )}

      {/* Modal de Apuesta */}
      {showBetModal && selectedBattle && (
        <BetModal
          battle={selectedBattle}
          onClose={() => {
            setShowBetModal(false);
            setSelectedBattle(null);
          }}
          onPlaceBet={handlePlaceBet}
        />
      )}

      {/* Modal de éxito/error */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
          }}
        />
      )}
    </div>
  );
}

function BattleCard({
  battle,
  onPlaceBet
}: {
  battle: EnrichedBattle;
  onPlaceBet: (contestantId: string) => void;
}) {
  const contestant1Name = battle.contestant_1_name || 'Gladiador Desconocido';
  const contestant2Name = battle.contestant_2_name || 'Gladiador Desconocido';
  const contestant1Dictator = battle.contestant_1_dictator || 'Dictador Desconocido';
  const contestant2Dictator = battle.contestant_2_dictator || 'Dictador Desconocido';

  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {contestant1Name} vs {contestant2Name}
          </h3>
          <p className="text-gray-400 text-sm mb-1">
            Dictadores: {contestant1Dictator} vs {contestant2Dictator}
          </p>
          <p className="text-gray-500 text-xs">
            Fecha: {battle.date ? new Date(battle.date).toLocaleDateString() : 'Fecha no disponible'}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {battle.can_bet ? (
            <span className="px-3 py-1 rounded text-xs border text-green-400 bg-green-900/20 border-green-600">
              Disponible para apostar
            </span>
          ) : (
            <span className="px-3 py-1 rounded text-xs border text-red-400 bg-red-900/20 border-red-600">
              Batalla unicamente disponible para observar
            </span>
          )}
          
          {battle.is_own_battle && (
            <span className="px-2 py-1 rounded text-xs text-red-400 bg-red-900/20 border border-red-600">
              Uno de tus gladiadores participa en esta batalla
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contestant 1 */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {contestant1Name}
          </h4>
          <div className="space-y-2 mb-4">
            {battle.contestant_1_nickname && (
              <div className="text-xs text-gray-300 italic">"{battle.contestant_1_nickname}"</div>
            )}
            <div className="text-xs text-gray-400">
              Dictador: {contestant1Dictator}
            </div>
            <div className="text-xs text-gray-500">
              ID: {battle.contestant_1?.slice(-8) || 'N/A'}
            </div>
          </div>
          <button
            onClick={() => onPlaceBet(battle.contestant_1)}
            disabled={!battle.can_bet || !battle.contestant_1}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            {battle.can_bet ? 'Apostar' : 'No disponible'}
          </button>
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-full w-16 h-16 flex items-center justify-center">
            <span className="text-red-600 font-bold text-xl">VS</span>
          </div>
        </div>

        {/* Contestant 2 */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {contestant2Name}
          </h4>
          <div className="space-y-2 mb-4">
            {battle.contestant_2_nickname && (
              <div className="text-xs text-gray-300 italic">"{battle.contestant_2_nickname}"</div>
            )}
            <div className="text-xs text-gray-400">
              Dictador: {contestant2Dictator}
            </div>
            <div className="text-xs text-gray-500">
              ID: {battle.contestant_2?.slice(-8) || 'N/A'}
            </div>
          </div>
          <button
            onClick={() => onPlaceBet(battle.contestant_2)}
            disabled={!battle.can_bet || !battle.contestant_2}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            {battle.can_bet ? 'Apostar' : 'No disponible'}
          </button>
        </div>
      </div>

      {battle.is_own_battle && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded">
          <p className="text-blue-400 text-sm flex items-center gap-2">
            <Info className="w-5 h-5" />
            Esta batalla incluye a uno de tus gladiadores. No puedes apostar en batallas de tus propios gladiadores, pero puedes observar el progreso.
          </p>
        </div>
      )}
    </div>
  );
}

function BetCard({ bet }: { bet: MyBet }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'Lost': return 'text-red-400 bg-red-900/20 border-red-600';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-2">
            Apuesta #{bet.id?.slice(-8) || 'N/A'}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="text-gray-400">
              Cantidad: ${bet.amount?.toLocaleString() || '0'}
            </div>
            {bet.payout && bet.payout > 0 && (
              <div className="text-green-400">
                Ganancia: ${bet.payout.toLocaleString()}
              </div>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(bet.status)}`}>
          {bet.status || 'Pendiente'}
        </span>
      </div>
    </div>
  );
}

function BetModal({
  battle,
  onClose,
  onPlaceBet
}: {
  battle: EnrichedBattle;
  onClose: () => void;
  onPlaceBet: (battleId: string, contestantId: string, amount: number) => void;
}) {
  const [betAmount, setBetAmount] = useState(100);
  const [selectedContestant, setSelectedContestant] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContestant) return;

    if (!battle.can_bet) {
      alert('No puedes apostar en esta batalla porque incluye a uno de tus gladiadores.');
      return;
    }

    setLoading(true);
    try {
      await onPlaceBet(battle.id, selectedContestant, betAmount);
      onClose();
    } catch (error) {
      console.error('Error al realizar apuesta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-red-600 mb-6">
          Realizar Apuesta
        </h3>

        {!battle.can_bet && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded">
            <p className="text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              No puedes apostar en esta batalla porque incluye a uno de tus gladiadores.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Apostar por:</label>
            <select
              value={selectedContestant}
              onChange={(e) => setSelectedContestant(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
              required
              disabled={!battle.can_bet}
            >
              <option value="">Selecciona un gladiador</option>
              <option value={battle.contestant_1}>
                {battle.contestant_1_name} ({battle.contestant_1_dictator})
              </option>
              <option value={battle.contestant_2}>
                {battle.contestant_2_name} ({battle.contestant_2_dictator})
              </option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">
              Cantidad: ${betAmount.toLocaleString()}
            </label>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value))}
              className="w-full accent-red-600"
              disabled={!battle.can_bet}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$50</span>
              <span>$5,000</span>
            </div>
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
              disabled={loading || !selectedContestant || !battle.can_bet}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? 'Apostando...' : `Apostar $${betAmount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
            {isError ? 'Error en la Apuesta' : 'Apuesta Exitosa'}
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
