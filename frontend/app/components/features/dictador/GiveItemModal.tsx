'use client';
import { useState, useEffect } from 'react';
import { X, Package, Gift, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface Item {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  dictator_id: string; 
}

interface GiveItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  contestantId: string;
  contestantName: string;
  onSuccess: () => void;
}

export default function GiveItemModal({ 
  isOpen, 
  onClose, 
  contestantId, 
  contestantName, 
  onSuccess 
}: GiveItemModalProps) {
  const [inventory, setInventory] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

  const fetchInventory = async () => {
    setLoadingInventory(true);
    try {
      console.log('Cargando inventario del dictador para dar items...');

      const response = await api.get('/dictator/inventory');

      console.log('Inventario recibido:', response.data);

      const availableWeapons = response.data.filter((item: Item) => {
        console.log(`Item: ${item.item_name}, category: ${item.category}, quantity: ${item.quantity}, dictator_id: ${item.dictator_id}`);
        return item.quantity > 0 && item.category === 'weapon';
      });

      console.log('Weapons disponibles para dar:', availableWeapons.length);
      setInventory(availableWeapons);
    } catch (error: any) {
      console.error('Error al cargar inventario:', error);
      setError('Error al cargar inventario');
      setInventory([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleGiveItem = async () => {
    if (!selectedItem) return;

    setLoading(true);
    setError('');

    try {
        const selectedItemData = inventory.find(item => item.id === selectedItem);

        if (!selectedItemData) {
            setError('Item no encontrado');
            return;
        }
        await api.post('/dictator/give-item', {
            contestantId,
            itemName: selectedItemData.item_name,
        });

        setSuccessMessage(`Weapon "${selectedItemData.item_name}" entregada exitosamente a ${contestantName}.`);
        setShowSuccessModal(true);

    } catch (error: any) {
        setError(error.response?.data?.error || 'Error al dar item');
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

  if (!isOpen) return null;

  const selectedItemData = inventory.find(item => item.id === selectedItem);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-red-600 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Dar Weapon a {contestantName}
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
            {loadingInventory ? (
              <div className="text-center py-4">
                <div className="text-gray-400">Cargando weapons...</div>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-4">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No tienes weapons disponibles en tu inventario</p>
                <p className="text-gray-500 text-sm">Solo se pueden dar weapons a los contestants. Para buffs, usa el botón "Aplicar Buff"</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-400 mb-2">Seleccionar Weapon</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                  >
                    <option value="">Selecciona una weapon...</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.item_name} ({item.quantity} disponibles)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItemData && (
                  <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                    <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Detalles de la Weapon
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weapon:</span>
                        <span className="text-white">{selectedItemData.item_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tipo:</span>
                        <span className="text-blue-400 capitalize">{selectedItemData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disponibles:</span>
                        <span className="text-green-400">{selectedItemData.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contestant:</span>
                        <span className="text-red-400">{contestantName}</span>
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
              onClick={handleGiveItem}
              disabled={!selectedItem || loading || inventory.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              <Gift className="w-4 h-4" />
              {loading ? 'Entregando...' : 'Dar Weapon'}
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
            Weapon Entregada
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
