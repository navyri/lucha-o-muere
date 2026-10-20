'use client';
import { useState, useEffect } from 'react';
import { X, Eye, Zap, Package, Clock, User, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface ContestantDetails {
  contestant: {
    id: string;
    name: string;
    nickname?: string;
    strength: number;
    agility: number;
    health: number;
    wins: number;
    losses: number;
    status: string;
  };
  buffs: Array<{
    id: string;
    name: string;
    effect: string;
    strength_boost: string; // VARCHAR en la DB
    agility_boost: string;  // VARCHAR en la DB
    duration: number;
    source_type: string;
  }>;
  items: Array<{
    id: string;
    item_name: string;
    source: string;
    giver_id: string;
    assigned_at: string; // Campo real de la DB
  }>;
  totalBuffs: number;
  totalItems: number;
}

interface ContestantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestantId: string;
  contestantName: string;
}

export default function ContestantDetailsModal({
  isOpen,
  onClose,
  contestantId,
  contestantName
}: ContestantDetailsModalProps) {
  const [details, setDetails] = useState<ContestantDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && contestantId) {
      fetchContestantDetails();
    }
  }, [isOpen, contestantId]);

  const fetchContestantDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Cargando detalles del contestant:', contestantId);
      
      const response = await api.get(`/dictator/contestants/${contestantId}/details`);
      
      console.log('Detalles recibidos:', response.data);
      setDetails(response.data);
    } catch (error: any) {
      console.error('Error al cargar detalles:', error);
      setError(error.response?.data?.error || 'Error al cargar detalles del contestant');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPowerBoost = () => {
    if (!details || !details.buffs) return { strength: 0, agility: 0 };
    
    return details.buffs.reduce((total, buff) => ({
      // Convertir VARCHAR a número
      strength: total.strength + (parseInt(buff.strength_boost) || 0),
      agility: total.agility + (parseInt(buff.agility_boost) || 0)
    }), { strength: 0, agility: 0 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-red-600 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detalles de {contestantName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Cargando detalles del contestant...</div>
          </div>
        ) : details && details.contestant ? (
          <div className="space-y-6">
            {/* Información del Contestant */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
              <h4 className="text-red-600 font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Contestant
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nombre:</span>
                    <span className="text-white">{details.contestant.name || 'Sin nombre'}</span>
                  </div>
                  {details.contestant.nickname && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Apodo:</span>
                      <span className="text-gray-300 italic">"{details.contestant.nickname}"</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estado:</span>
                    <span className={`${
                      details.contestant.status === 'Alive' ? 'text-green-400' :
                      details.contestant.status === 'Injured' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {details.contestant.status || 'Desconocido'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Victorias:</span>
                    <span className="text-green-400">{details.contestant.wins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Derrotas:</span>
                    <span className="text-red-400">{details.contestant.losses || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Récord:</span>
                    <span className="text-white">{details.contestant.wins || 0}W - {details.contestant.losses || 0}L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas con Buffs */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
              <h4 className="text-red-600 font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Estadísticas (Base + Buffs)
              </h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{details.contestant.health || 0}</div>
                  <div className="text-gray-400 text-sm">Salud</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {details.contestant.strength || 0}
                    {getTotalPowerBoost().strength > 0 && (
                      <span className="text-green-400 text-lg"> +{getTotalPowerBoost().strength}</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">Fuerza</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {details.contestant.agility || 0}
                    {getTotalPowerBoost().agility > 0 && (
                      <span className="text-green-400 text-lg"> +{getTotalPowerBoost().agility}</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-sm">Agilidad</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buffs Activos */}
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                <h4 className="text-red-600 font-semibold mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Buffs Activos ({details.totalBuffs || 0})
                </h4>
                
                {!details.buffs || details.buffs.length === 0 ? (
                  <div className="text-center py-4">
                    <Zap className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Sin buffs activos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {details.buffs.map((buff) => (
                      <div key={buff.id} className="p-3 bg-[#0f0f0f] border border-[#444] rounded">
                        <div className="flex items-start gap-2">
                          <Zap className="w-4 h-4 text-purple-400 mt-1" />
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{buff.name || 'Buff sin nombre'}</h5>
                            <div className="text-xs text-gray-400 space-y-1">
                              {(parseInt(buff.strength_boost) || 0) > 0 && (
                                <div className="text-blue-400">+{buff.strength_boost} Fuerza</div>
                              )}
                              {(parseInt(buff.agility_boost) || 0) > 0 && (
                                <div className="text-purple-400">+{buff.agility_boost} Agilidad</div>
                              )}
                              <div className="flex items-center gap-1 text-yellow-400">
                                <Clock className="w-3 h-3" />
                                {buff.duration || 0} batalla{(buff.duration || 0) !== 1 ? 's' : ''}
                              </div>
                              <div className="text-green-400 capitalize">
                                Aplicado por {buff.source_type || 'desconocido'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items Equipados */}
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                <h4 className="text-red-600 font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Items Equipados ({details.totalItems || 0})
                </h4>
                
                {!details.items || details.items.length === 0 ? (
                  <div className="text-center py-4">
                    <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Sin items equipados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {details.items.map((item) => (
                      <div key={item.id} className="p-3 bg-[#0f0f0f] border border-[#444] rounded">
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-orange-400 mt-1" />
                          <div className="flex-1">
                            <h5 className="text-white font-medium">{item.item_name || 'Item sin nombre'}</h5>
                            <div className="text-xs text-gray-400 space-y-1">
                              <div className="text-green-400 capitalize">
                                Donado por {item.source || 'desconocido'}
                              </div>
                              {item.assigned_at && (
                                <div className="text-gray-500">
                                  {formatDate(item.assigned_at)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No se pudieron cargar los detalles</div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
