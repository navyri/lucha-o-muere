'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, Search, Filter, Eye, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface MarketItem {
  id: string;
  item: string;
  amount: string;
  status: string;
  transaction_date: string;
  buyer_id?: string;
  seller_id?: string;
}

export default function SponsorBlackMarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchMarketItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedStatus]);

  const fetchMarketItems = async () => {
    try {
      const response = await api.get('/sponsor/blackmarket/listings');
      setItems(response.data || []);
    } catch (error: any) {
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

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  };

  // Función para redirigir al inventario
  const handleGoToInventory = () => {
    router.push('/sponsor/inventario');
  };

  const getStatuses = () => {
    const statuses = [...new Set(items.map(item => item.status))];
    return statuses;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Discovered': return 'text-green-400 border-green-400';
      case 'Completed': return 'text-blue-400 border-blue-400';  
      default: return 'text-gray-400 border-gray-400';
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
      {/* Header con botón para vender */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
              <Eye className="w-8 h-8" />
              Catálogo del Mercado Negro
            </h1>
            <p className="text-gray-400">Explora los items disponibles en el mercado</p>
          </div>
          
          {/* Botón para ir a vender en el inventario */}
          <button
            onClick={handleGoToInventory}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Vender mis Items
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Información para sponsors */}
        <div className="mt-4 p-4 bg-red-900/20 border border-red-600 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Información para Sponsors</span>
          </div>
          <p className="text-red-300 text-sm">
            Como sponsor, puedes <strong>visualizar</strong> todos los items del mercado negro, pero solo los <strong>Dictadores pueden comprar</strong>. 
            Si deseas vender tus items, usa el botón "Vender mis Items" para ir a tu inventario.
          </p>
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
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-semibold">Items en Catálogo</span>
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
              ? Math.round(filteredItems.reduce((sum, item) => sum + parseFloat(item.amount), 0) / filteredItems.length).toLocaleString()
              : '0'
            }
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Estados</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {getStatuses().length}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
        >
          <option value="all">Todos los estados</option>
          {getStatuses().map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {items.length === 0 ? 'No hay items en el catálogo' : 'No se encontraron items'}
          </h3>
          <p className="text-gray-500 mb-6">
            {items.length === 0 
              ? 'Los items aparecerán aquí cuando estén disponibles en el mercado'
              : 'Prueba con otros filtros de búsqueda'
            }
          </p>
          
          {/* Botón para vender cuando no hay items */}
          <button
            onClick={handleGoToInventory}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <DollarSign className="w-5 h-5" />
            Vender mis Items
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              getStatusColor={getStatusColor}
              onGoToInventory={handleGoToInventory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta solo para visualización
function CatalogItemCard({
  item,
  getStatusColor,
  onGoToInventory
}: {
  item: MarketItem;
  getStatusColor: (status: string) => string;
  onGoToInventory: () => void;
}) {
  const itemPrice = parseFloat(item.amount);

  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">
            {item.item}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            ${itemPrice.toLocaleString()}
          </div>
          <div className="text-gray-400 text-xs">
            {new Date(item.transaction_date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Información sobre restricciones */}
      <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-semibold">Solo Visualización</span>
        </div>
      </div>
    </div>
  );
}
