'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, Plus, Search, CheckCircle, X } from 'lucide-react';
import api from '@/lib/api';

interface MarketItem {
  id: string;
  item: string;
  amount: number;
  status: 'Discovered' | 'Completed';
  transaction_date: string;
  seller_id: string;
  seller_name?: string;
  category?: string;
  description?: string;
}

export default function DictatorBlackMarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMarketItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm]);

  const fetchMarketItems = async () => {
    try {
      const response = await api.get('/dictator/blackmarket/Activity');
      
      console.log('Black Market - Data recibida:', response.data);
      
      // Mapear la estructura real del backend del dictador
      const mappedItems = response.data.map((item: any) => ({
        id: item.id,
        item: item.item || 'Item sin nombre',
        amount: Number(item.amount) || 0,
        status: item.status || 'Discovered',
        transaction_date: item.transaction_date || '',
        seller_id: item.seller_id || '',
        seller_name: item.seller_name || 'Anónimo',
        category: item.category || 'general',
        description: item.description || ''
      }));
      
      setItems(mappedItems);
    } catch (error: any) {
      console.error('Error al cargar Black Market:', error);
      if (error.response?.status === 404) {
        setItems([]);
        setError('');
      } else {
        setError(error.response?.data?.error || 'Error al cargar items del mercado');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filtrar solo por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const handleBuyItem = async (item: MarketItem) => {
    setPurchasing(item.id);

    try {
      await api.post('/dictator/blackmarket/buy-item', {
        transactionId: item.id
      });

      setSuccessMessage(`Item "${item.item}" comprado exitosamente y agregado a tu inventario.`);
      setShowSuccessModal(true);
      
      // Remover el item de la lista después de comprarlo
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error: any) {
      setSuccessMessage(`Error al comprar item: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando mercado negro...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            Mercado Negro
          </h1>
          <p className="text-gray-400">Compra items especiales para tus gladiadores</p>
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
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Items Disponibles</span>
          </div>
          <div className="text-2xl font-bold text-white">{filteredItems.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Precio Promedio</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${filteredItems.length > 0 
              ? Math.round(filteredItems.reduce((sum, item) => sum + item.amount, 0) / filteredItems.length).toLocaleString()
              : '0'
            }
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Más Barato</span>
          </div>
          <div className="text-2xl font-bold text-white">
            ${filteredItems.length > 0 
              ? Math.min(...filteredItems.map(item => item.amount)).toLocaleString()
              : '0'
            }
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {items.length}
          </div>
        </div>
      </div>

      {/* Solo barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
          />
        </div>
      </div>

      {/* Lista de Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {items.length === 0 ? 'No hay items disponibles' : 'No se encontraron items'}
          </h3>
          <p className="text-gray-500">
            {items.length === 0 
              ? 'Los items aparecerán aquí cuando estén disponibles en el mercado'
              : 'Prueba con otros términos de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onBuy={handleBuyItem}
              purchasing={purchasing === item.id}
            />
          ))}
        </div>
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

// Componente de tarjeta de item simplificado
function ItemCard({
  item,
  onBuy,
  purchasing
}: {
  item: MarketItem;
  onBuy: (item: MarketItem) => void;
  purchasing: boolean;
}) {
  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">
            {item.item}
          </h3>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            ${item.amount.toLocaleString()}
          </div>
          <div className="text-gray-400 text-sm">
            {item.seller_name || 'Anónimo'}
          </div>
        </div>
      </div>

      {item.description && (
        <p className="text-gray-300 text-sm mb-4">
          {item.description}
        </p>
      )}

      <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333] rounded">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Vendedor:</span>
          <span className="text-white">{item.seller_name || 'Anónimo'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Fecha:</span>
          <span className="text-gray-400">{new Date(item.transaction_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Solo botón de compra */}
      <button
        onClick={() => onBuy(item)}
        disabled={purchasing}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
      >
        <Plus className="w-4 h-4" />
        {purchasing ? 'Comprando...' : 'Comprar Item'}
      </button>
    </div>
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
            {isError ? 'Error en la Compra' : 'Compra Exitosa'}
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
