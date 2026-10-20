'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Package, Plus, Search, Filter } from 'lucide-react';
import api from '@/lib/api';

interface MarketItem {
  id: string;
  item_name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  effect?: string;
  rarity?: string;
}

export default function SponsorBlackMarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchMarketItems();
    fetchUserBalance();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

const fetchMarketItems = async () => {
  try {
    const response = await api.get('/sponsor/blackmarket/listings');
    
    // Debug para ver qué estructura devuelve
    console.log('Black Market - Data recibida:', response.data);
    
    // Mapear la estructura real del backend
    const mappedItems = response.data.map((item: any) => ({
      id: item.id,
      item_name: item.item_name || item.name || 'Item sin nombre',
      description: item.description || '',
      price: Number(item.price) || 0,
      category: item.category || 'general',
      stock: Number(item.stock) || Number(item.quantity) || 0,
      effect: item.effect || '',
      rarity: item.rarity || 'common'
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


  const fetchUserBalance = async () => {
    try {
      const response = await api.get('/sponsor/balance');
      setUserBalance(response.data.balance || 0);
    } catch (error) {
      console.error('Error al cargar balance:', error);
    }
  };

  const filterItems = () => {
  let filtered = items;

  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter(item =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Filtrar por categoría
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(item => item.category === selectedCategory);
  }

  setFilteredItems(filtered);
};


  const handleBuyItem = async (item: MarketItem) => {
    if (userBalance < item.price) {
      alert('No tienes suficiente dinero para comprar este item');
      return;
    }

    if (item.stock <= 0) {
      alert('Este item está agotado');
      return;
    }

    if (!confirm(`¿Confirmas la compra de "${item.item_name}" por $${item.price}?`)) {
      return;
    }

    try {
    await api.post('/sponsor/blackmarket/buy-item', {
      item_id: item.id,
      quantity: 1
    });

    alert('Item comprado exitosamente');
    fetchMarketItems();
    fetchUserBalance();
  } catch (error: any) {
    alert(error.response?.data?.error || 'Error al comprar item');
  }
};

  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'uncommon': return 'text-green-400 border-green-400';
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <ShoppingBag className="w-8 h-8" />
            Mercado Negro
          </h1>
          <p className="text-gray-400">Compra items especiales para tus gladiadores</p>
        </div>
        
        <div className="text-right">
          <div className="text-gray-400 text-sm">Tu Balance:</div>
          <div className="text-2xl font-bold text-green-400">
            ${userBalance.toLocaleString()}
          </div>
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
              ? Math.round(filteredItems.reduce((sum, item) => sum + item.price, 0) / filteredItems.length).toLocaleString()
              : '0'
            }
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Stock Total</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {filteredItems.reduce((sum, item) => sum + item.stock, 0)}
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold">Categorías</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {getCategories().length}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda */}
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

        {/* Filtro por categoría */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
        >
          <option value="all">Todas las categorías</option>
          {getCategories().map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
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
              : 'Prueba con otros filtros de búsqueda'
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
              getRarityColor={getRarityColor}
              userBalance={userBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de item
function ItemCard({
  item,
  onBuy,
  getRarityColor,
  userBalance
}: {
  item: MarketItem;
  onBuy: (item: MarketItem) => void;
  getRarityColor: (rarity: string) => string;
  userBalance: number;
}) {
  const canAfford = userBalance >= item.price;
  const inStock = item.stock > 0;

  return (
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">
            {item.item_name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-sm capitalize">
              {item.category}
            </span>
            {item.rarity && (
              <span className={`px-2 py-1 rounded text-xs border ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            ${item.price.toLocaleString()}
          </div>
          <div className={`text-sm ${inStock ? 'text-white' : 'text-red-400'}`}>
            Stock: {item.stock}
          </div>
        </div>
      </div>

      {item.description && (
        <p className="text-gray-300 text-sm mb-4">
          {item.description}
        </p>
      )}

      {item.effect && (
        <div className="mb-4 p-3 bg-[#1a1a1a] border border-[#333] rounded">
          <div className="flex justify-between">
            <span className="text-gray-400 text-sm">Efecto:</span>
            <span className="text-green-400 text-sm font-semibold">{item.effect}</span>
          </div>
        </div>
      )}

      {/* Estado del item */}
      <div className="mb-4">
        {!canAfford && (
          <div className="text-red-400 text-sm mb-2">
            Necesitas ${(item.price - userBalance).toLocaleString()} más
          </div>
        )}
        {!inStock && (
          <div className="text-red-400 text-sm mb-2">
            Agotado
          </div>
        )}
      </div>

      {/* Botón de compra */}
      <div className="flex">
        <button
          onClick={() => onBuy(item)}
          disabled={!canAfford || !inStock}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          {!inStock ? 'Agotado' : !canAfford ? 'Sin fondos' : 'Comprar'}
        </button>
      </div>
    </div>
  );
}
