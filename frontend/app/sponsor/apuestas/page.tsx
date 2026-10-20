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

interface EnrichedBattle extends Battle {
  contestant_1_name: string;
  contestant_1_nickname: string;
  contestant_2_name: string;
  contestant_2_nickname: string;
  contestant_1_dictator: string;
  contestant_2_dictator: string;
  contestant_1_info?: Contestant;
  contestant_2_info?: Contestant;
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
  contestant_1_name?: string;
  contestant_2_name?: string;
  predicted_winner_name?: string;
}

export default function SponsorApuestasPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'my-bets' | 'history'>('available');
  const [battles, setBattles] = useState<EnrichedBattle[]>([]);
  const [myBets, setMyBets] = useState<MyBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<EnrichedBattle | null>(null);
  const [selectedContestant, setSelectedContestant] = useState<{id: string, name: string, nickname: string}>({id: '', name: '', nickname: ''});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Cargando batallas y apuestas...');
      
      // Usar endpoints correctos para sponsors
      const [battlesResponse, contestantsResponse] = await Promise.all([
        api.get('/sponsor/battles/active'),
        api.get('/sponsor/contestants')
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

      console.log('Batallas para apuestas:', rawBattles.length);
      console.log('Estructura de respuesta de batallas:', battlesResponse.data);
      console.log('Contestants disponibles:', contestants.length);

      // Crear mapa de contestants
      const contestantMap = new Map();
      contestants.forEach((contestant: Contestant) => {
        contestantMap.set(contestant.contestant_id, contestant);
      });

      // Enriquecer batallas con datos de contestants
      const enrichedBattles: EnrichedBattle[] = rawBattles.map((battle: Battle) => {
        const contestant1Info = contestantMap.get(battle.contestant_1);
        const contestant2Info = contestantMap.get(battle.contestant_2);

        return {
          ...battle,
          contestant_1_name: contestant1Info?.contestant_name || `Contestant ${battle.contestant_1?.slice(-6)}`,
          contestant_1_nickname: contestant1Info?.nickname || '',
          contestant_2_name: contestant2Info?.contestant_name || `Contestant ${battle.contestant_2?.slice(-6)}`,
          contestant_2_nickname: contestant2Info?.nickname || '',
          contestant_1_dictator: contestant1Info?.dictator_name || 'Dictador Desconocido',
          contestant_2_dictator: contestant2Info?.dictator_name || 'Dictador Desconocido',
          contestant_1_info: contestant1Info,
          contestant_2_info: contestant2Info
        };
      });

      setBattles(enrichedBattles);

      // Cargar apuestas del sponsor
      try {
        const betsResponse = await api.get('/sponsor/my-bets');
        console.log('Mis apuestas:', betsResponse.data);
        
        // El backend devuelve { bettorType, totalBets, bets }
        setMyBets(betsResponse.data.bets || []);
      } catch (betsError) {
        console.log('Endpoint de apuestas no disponible o sin apuestas');
        setMyBets([]);
      }

    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      console.error('Detalles del error:', error.response?.data);
      setError(error.response?.data?.error || 'Error al cargar datos de apuestas');
      
      // ✅ En caso de error, asegurar arrays vacíos
      setBattles([]);
      setMyBets([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = async (battleId: string, contestantId: string, amount: number) => {
    try {
      await api.post('/sponsor/place-bet', {
        battleId: battleId,
        predictedWinner: contestantId,
        amount: amount           
      });
      setSuccessMessage('Apuesta realizada exitosamente');
      setShowSuccessModal(true);
      fetchData(); // Refrescar datos
    } catch (error: any) {
      setSuccessMessage(`Error al realizar apuesta: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    }
  };

  const getAvailableBattles = () => battles.filter(b => 
    b.status === 'Approved' && !b.winner_id
  );

  const getActiveBets = () => myBets.filter(bet => 
    bet.status === 'pending' || !bet.status || bet.status === 'active'
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
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
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
            <span className="text-blue-400 font-semibold">Apuestas Activas</span>
          </div>
          <div className="text-2xl font-bold text-white">{getActiveBets().length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Apuestas Ganadas</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myBets.filter(bet => bet.status === 'Won').length}
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
                No hay batallas disponibles para apostar
              </h3>
              <p className="text-gray-500">
                Las batallas aparecerán aquí cuando sean aprobadas
              </p>
            </div>
          ) : (
            getAvailableBattles().map((battle) => (
              <BettingBattleCard
                key={battle.id}
                battle={battle}
                onPlaceBet={(contestantId, contestantName, contestantNickname) => {
                  setSelectedBattle(battle);
                  setSelectedContestant({id: contestantId, name: contestantName, nickname: contestantNickname});
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
              <p className="text-gray-500">
                Tus apuestas activas aparecerán aquí
              </p>
            </div>
          ) : (
            getActiveBets().map((bet) => (
              <BetCard key={bet.id} bet={bet} />
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
              <p className="text-gray-500">
                Tu historial de apuestas aparecerá aquí
              </p>
            </div>
          ) : (
            getCompletedBets().map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))
          )}
        </div>
      )}

      {/* Modal de Apuesta */}
      {showBetModal && selectedBattle && (
        <BetModal
          isOpen={showBetModal}
          onClose={() => {
            setShowBetModal(false);
            setSelectedBattle(null);
            setSelectedContestant({id: '', name: '', nickname: ''});
          }}
          battle={selectedBattle}
          contestant={selectedContestant}
          onPlaceBet={handlePlaceBet}
        />
      )}

      {/* Modal de éxito/error personalizado */}
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

// Componente de batalla para apuestas
function BettingBattleCard({
  battle,
  onPlaceBet
}: {
  battle: EnrichedBattle;
  onPlaceBet: (contestantId: string, contestantName: string, contestantNickname: string) => void;
}) {
  return (
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
            Fecha: {new Date(battle.date).toLocaleDateString()}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs border text-green-400 bg-green-900/20 border-green-600">
          Disponible para apostar
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {battle.contestant_1_info && (
              <div className="text-xs space-y-1">
                <div className="text-gray-400">Victorias: {battle.contestant_1_info.wins}</div>
                <div className="text-gray-400">Derrotas: {battle.contestant_1_info.losses}</div>
                <div className="text-yellow-400">
                  Poder: {battle.contestant_1_info.strength + battle.contestant_1_info.agility + battle.contestant_1_info.health}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onPlaceBet(battle.contestant_1, battle.contestant_1_name, battle.contestant_1_nickname)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Apostar
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
            {battle.contestant_2_name}
          </h4>
          <div className="space-y-2 mb-4">
            {battle.contestant_2_nickname && (
              <div className="text-xs text-gray-300 italic">"{battle.contestant_2_nickname}"</div>
            )}
            <div className="text-xs text-gray-400">
              Dictador: {battle.contestant_2_dictator}
            </div>
            {battle.contestant_2_info && (
              <div className="text-xs space-y-1">
                <div className="text-gray-400">Victorias: {battle.contestant_2_info.wins}</div>
                <div className="text-gray-400">Derrotas: {battle.contestant_2_info.losses}</div>
                <div className="text-yellow-400">
                  Poder: {battle.contestant_2_info.strength + battle.contestant_2_info.agility + battle.contestant_2_info.health}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => onPlaceBet(battle.contestant_2, battle.contestant_2_name, battle.contestant_2_nickname)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Apostar
          </button>
        </div>
      </div>
    </div>
  );
}

function BetCard({ bet }: { bet: MyBet }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Won': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Lost': return <X className="w-4 h-4 text-red-400" />;
      case 'Closed': return <X className="w-4 h-4 text-gray-400" />;
      case 'pending':
      default: return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'Lost': return 'text-red-400 bg-red-900/20 border-red-600';
      case 'Closed': return 'text-gray-400 bg-gray-900/20 border-gray-600';
      case 'pending':
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-2">
            Apuesta en Batalla #{bet.battle_id.slice(-8)}
          </h4>
          <div className="space-y-1 text-sm">
            <div className="text-gray-400">
              Contestant: {bet.predicted_winner_name || bet.predicted_winner.slice(-8)}
            </div>
            <div className="text-gray-400">
              Cantidad: ${bet.amount.toLocaleString()}
            </div>
            {bet.payout && bet.payout > 0 && (
              <div className="text-green-400">
                Ganancia: ${bet.payout.toLocaleString()}
              </div>
            )}
            <div className="text-gray-500 text-xs">
              {new Date(bet.bet_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(bet.status)}
          <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(bet.status)}`}>
            {bet.status || 'Pendiente'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Modal de apuesta
function BetModal({
  isOpen,
  onClose,
  battle,
  contestant,
  onPlaceBet
}: {
  isOpen: boolean;
  onClose: () => void;
  battle: EnrichedBattle;
  contestant: {id: string, name: string, nickname: string};
  onPlaceBet: (battleId: string, contestantId: string, amount: number) => void;
}) {
  const [betAmount, setBetAmount] = useState(100);
  const [loading, setLoading] = useState(false);

  const contestantInfo = battle.contestant_1 === contestant.id 
    ? battle.contestant_1_info 
    : battle.contestant_2_info;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (betAmount < 50) {
      alert('La apuesta mínima es $50');
      return;
    }

    setLoading(true);
    try {
      await onPlaceBet(battle.id, contestant.id, betAmount);
      onClose();
    } catch (error) {
      console.error('Error al realizar apuesta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-red-600 mb-6">
          Realizar Apuesta
        </h3>

        <div className="mb-4 p-4 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold mb-2">{contestant.name}</h4>
          {contestant.nickname && (
            <p className="text-gray-300 text-sm italic mb-2">"{contestant.nickname}"</p>
          )}
          <div className="text-sm space-y-1">
            <div className="text-gray-400">
              Batalla: {battle.contestant_1_name} vs {battle.contestant_2_name}
            </div>
            {contestantInfo && (
              <>
                <div className="text-gray-400">
                  Récord: {contestantInfo.wins}W - {contestantInfo.losses}L
                </div>
                <div className="text-yellow-400">
                  Poder Total: {contestantInfo.strength + contestantInfo.agility + contestantInfo.health}
                </div>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">
              Cantidad a apostar: ${betAmount.toLocaleString()}
            </label>
            <input
              type="range"
              min="50"
              max="5000"
              step="50"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value))}
              className="w-full accent-red-600"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$50</span>
              <span>$5,000</span>
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded">
            <h5 className="text-white font-semibold mb-2">Resumen de Apuesta</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cantidad:</span>
                <span className="text-white">${betAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contestant:</span>
                <span className="text-white">{contestant.name}</span>
              </div>
              <div className="flex justify-between border-t border-[#444] pt-2">
                <span className="text-gray-400">Ganancia potencial:</span>
                <span className="text-green-400 font-bold">${(betAmount * 2).toLocaleString()}</span>
              </div>
            </div>
          </div>

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
              disabled={loading || betAmount < 50}
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

// Modal de éxito/error personalizado
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
              <AlertTriangle className="w-8 h-8 text-red-400" />
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
