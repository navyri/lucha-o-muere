'use client';
import { useState, useEffect } from 'react';
import { X, Zap, TrendingUp, CheckCircle, Package } from 'lucide-react';
import api from '@/lib/api';

interface BuffItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  dictator_id: string;
}

interface ApplyBuffModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestantId: string;
  contestantName: string;
  onSuccess: () => void;
}

export default function ApplyBuffModal({ 
  isOpen, 
  onClose, 
  contestantId, 
  contestantName, 
  onSuccess 
}: ApplyBuffModalProps) {
  const [availableBuffs, setAvailableBuffs] = useState<BuffItem[]>([]);
  const [selectedBuff, setSelectedBuff] = useState('');
  const [buffStats, setBuffStats] = useState({
    strength_boost: 10,
    agility_boost: 10,
    duration: 3
  });
  const [loading, setLoading] = useState(false);
  const [loadingBuffs, setLoadingBuffs] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableBuffs();
    }
  }, [isOpen]);

  const fetchAvailableBuffs = async () => {
    setLoadingBuffs(true);
    try {
      console.log('Cargando buffs del dictador...');
      
      const response = await api.get('/dictator/inventory');
      
      console.log('Inventario recibido:', response.data);
      
      // Filtrar solo buffs disponibles (category = 'buff' y quantity > 0)
      const buffsWithStock = response.data.filter((item: BuffItem) => {
        console.log(`Item: ${item.item_name}, category: ${item.category}, quantity: ${item.quantity}`);
        return item.category === 'buff' && item.quantity > 0;
      });
      
      console.log('Buffs disponibles:', buffsWithStock.length);
      setAvailableBuffs(buffsWithStock);
    } catch (error: any) {
      console.error('Error al cargar buffs:', error);
      setError('Error al cargar buffs disponibles');
      setAvailableBuffs([]);
    } finally {
      setLoadingBuffs(false);
    }
  };

  const handleApplyBuff = async () => {
    if (!selectedBuff) return;

    setLoading(true);
    setError('');

    try {
      const selectedBuffData = availableBuffs.find(buff => buff.id === selectedBuff);
      
      // Usar el endpoint original que ya funciona
      await api.post('/dictator/apply-buff', {
        contestantId,
        item_name: selectedBuffData?.item_name,
        strength_boost: buffStats.strength_boost,
        agility_boost: buffStats.agility_boost,
        duration: buffStats.duration
      });
      
      setSuccessMessage(`Buff "${selectedBuffData?.item_name}" aplicado exitosamente a ${contestantName}.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al aplicar buff');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage('');
    onSuccess();
    onClose();
  };

  const getBuffEffect = () => {
    const effects = [];
    if (buffStats.strength_boost > 0) effects.push(`+${buffStats.strength_boost} Fuerza`);
    if (buffStats.agility_boost > 0) effects.push(`+${buffStats.agility_boost} Agilidad`);
    
    return effects.join(', ') || 'Sin efecto';
  };

  if (!isOpen) return null;

  const selectedBuffData = availableBuffs.find(buff => buff.id === selectedBuff);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Aplicar Buff a {contestantName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {loadingBuffs ? (
              <div className="text-center py-4">
                <div className="text-gray-400">Cargando buffs disponibles...</div>
              </div>
            ) : availableBuffs.length === 0 ? (
              <div className="text-center py-4">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No tienes buffs disponibles</p>
                <p className="text-gray-500 text-sm">Compra buffs en el Black Market para poder aplicarlos</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-400 mb-3">Seleccionar Buff ({availableBuffs.length} disponibles)</label>
                  <div className="space-y-3">
                    {availableBuffs.map((buff) => (
                      <div
                        key={buff.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedBuff === buff.id
                            ? 'border-red-600 bg-red-900/20'
                            : 'border-[#333] hover:border-[#444]'
                        }`}
                        onClick={() => setSelectedBuff(buff.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-white">{buff.item_name}</h4>
                              <span className="text-xs text-gray-400">
                                {buff.quantity} disponible{buff.quantity !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">Buff de categoría: {buff.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBuff && (
                  <div className="space-y-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                      <h4 className="text-red-600 font-semibold mb-3">Configurar Efectos del Buff</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-gray-400 mb-2">
                            Aumento de Fuerza: +{buffStats.strength_boost}
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="25"
                            value={buffStats.strength_boost}
                            onChange={(e) => setBuffStats(prev => ({
                              ...prev,
                              strength_boost: parseInt(e.target.value)
                            }))}
                            className="w-full accent-red-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>+5</span>
                            <span>+25</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Aumento de Agilidad: +{buffStats.agility_boost}
                          </label>
                          <input
                            type="range"
                            min="5"
                            max="25"
                            value={buffStats.agility_boost}
                            onChange={(e) => setBuffStats(prev => ({
                              ...prev,
                              agility_boost: parseInt(e.target.value)
                            }))}
                            className="w-full accent-red-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>+5</span>
                            <span>+25</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-2">
                            Duración: {buffStats.duration} batalla{buffStats.duration !== 1 ? 's' : ''}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={buffStats.duration}
                            onChange={(e) => setBuffStats(prev => ({
                              ...prev,
                              duration: parseInt(e.target.value)
                            }))}
                            className="w-full accent-red-600"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1</span>
                            <span>10</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                      <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Resumen del Buff
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Buff:</span>
                          <span className="text-white">{selectedBuffData?.item_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Efecto:</span>
                          <span className="text-green-400">{getBuffEffect()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duración:</span>
                          <span className="text-blue-400">{buffStats.duration} batalla{buffStats.duration !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Disponibles:</span>
                          <span className="text-yellow-400">{selectedBuffData?.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contestant:</span>
                          <span className="text-red-400">{contestantName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleApplyBuff}
              disabled={!selectedBuff || loading || availableBuffs.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Aplicando...' : 'Aplicar Buff'}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
}

function SuccessModal({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-900/20 border border-green-600">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-green-400">
            Buff Aplicado
          </h3>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
