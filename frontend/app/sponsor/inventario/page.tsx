'use client';
import { useState, useEffect } from 'react';
import { Package, Search, Filter, Gift, X, DollarSign, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  category: string;
  sponsor_id: string;
}

export default function SponsorInventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSellModal, setShowSellModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedCategory]);

  const fetchInventory = async () => {
    try {
      console.log('Cargando inventario del sponsor...');
      
      const [inventoryResponse, profileResponse] = await Promise.all([
        api.get('/sponsor/inventory'),
        api.get('/sponsor/profile')
      ]);
      
      console.log('Inventario - Data recibida:', inventoryResponse.data);
      console.log('Profile - Data recibida:', profileResponse.data);
      
      const userSponsorId = profileResponse.data.sponsor_id;
      console.log('Sponsor ID actual:', userSponsorId);
      
      const filteredItems = inventoryResponse.data.filter((item: any) => 
        item.sponsor_id === userSponsorId
      );
      
      console.log('Items filtrados (solo tuyos):', filteredItems);
      
      const mappedItems = filteredItems.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || 'Item sin nombre',
        quantity: Number(item.quantity) || 0,
        category: item.category || 'general',
        sponsor_id: item.sponsor_id || ''
      }));
      
      console.log('Items mapeados:', mappedItems);
      setItems(mappedItems);
    } catch (error: any) {
      console.error('Error al cargar inventario:', error);
      if (error.response?.status === 404) {
        setItems([]);
        setError('');
      } else {
        setError(error.response?.data?.error || 'Error al cargar inventario');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  };

  const handleSellItem = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      setSuccessMessage('No tienes unidades de este item para vender');
      setShowSuccessModal(true);
      return;
    }
    setSelectedItem(item);
    setShowSellModal(true);
  };

  // Nueva función para eliminar items
  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const getCategories = () => {
    const categories = [...new Set(items.map(item => item.category))];
    return categories;
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando tu inventario...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Mi Inventario
          </h1>
          <p className="text-gray-400">Gestiona tus items y ponlos en venta</p>
        </div>
        
        <button
          onClick={() => setShowAddItemModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Añadir Item
        </button>
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
            <span className="text-blue-400 font-semibold">Items Únicos</span>
          </div>
          <div className="text-2xl font-bold text-white">{filteredItems.length}</div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-white">{getTotalValue()}</div>
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

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Sin Stock</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {items.filter(item => item.quantity === 0).length}
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
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {items.length === 0 ? 'Tu inventario está vacío' : 'No se encontraron items'}
          </h3>
          <p className="text-gray-500 mb-4">
            {items.length === 0 
              ? 'Añade items a tu inventario para comenzar a patrocinar gladiadores'
              : 'Prueba con otros filtros de búsqueda'
            }
          </p>
          {items.length === 0 && (
            <button
              onClick={() => setShowAddItemModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              <Plus className="w-5 h-5" />
              Añadir tu Primer Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onSell={handleSellItem}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Modal para añadir items */}
      {showAddItemModal && (
        <AddItemModal
          onClose={() => setShowAddItemModal(false)}
          onSuccess={(message: string) => {
            setShowAddItemModal(false);
            setSuccessMessage(message);
            setShowSuccessModal(true);
            fetchInventory();
          }}
          onError={(message: string) => {
            setSuccessMessage(message);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Modal de venta */}
      {showSellModal && selectedItem && (
        <SellModal
          item={selectedItem}
          onClose={() => {
            setShowSellModal(false);
            setSelectedItem(null);
          }}
          onSuccess={(message: string) => {
            setShowSellModal(false);
            setSelectedItem(null);
            setSuccessMessage(message);
            setShowSuccessModal(true);
            fetchInventory();
          }}
          onError={(message: string) => {
            setSuccessMessage(message);
            setShowSuccessModal(true);
          }}
        />
      )}

      {/* Modal de eliminar */}
      {showDeleteModal && selectedItem && (
        <DeleteModal
          item={selectedItem}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          onSuccess={(message: string) => {
            setShowDeleteModal(false);
            setSelectedItem(null);
            setSuccessMessage(message);
            setShowSuccessModal(true);
            fetchInventory();
          }}
          onError={(message: string) => {
            setSuccessMessage(message);
            setShowSuccessModal(true);
          }}
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

// Componente de tarjeta de item con botón de eliminar
function ItemCard({
  item,
  onSell,
  onDelete
}: {
  item: InventoryItem;
  onSell: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}) {
  const hasStock = item.quantity > 0;

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
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${hasStock ? 'text-green-400' : 'text-red-400'}`}>
            {item.quantity}
          </div>
          <div className="text-gray-400 text-sm">
            {item.quantity === 1 ? 'unidad' : 'unidades'}
          </div>
        </div>
      </div>

      {!hasStock && (
        <div className="mb-4 p-2 bg-red-900/20 border border-red-600 rounded">
          <span className="text-red-400 text-sm">Sin stock</span>
        </div>
      )}

      {/* Botones con opción de eliminar */}
      <div className="flex gap-2">
        <button
          onClick={() => onSell(item)}
          disabled={!hasStock}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-400 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
        >
          <Gift className="w-3 h-3" />
          {hasStock ? 'Vender' : 'Sin stock'}
        </button>
        
        <button
          onClick={() => onDelete(item)}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
          title="Eliminar item"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Modal para eliminar items
function DeleteModal({
  item,
  onClose,
  onSuccess,
  onError
}: {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      await api.delete('/sponsor/delete-item', {
        data: { item_id: item.id }
      });
      
      onSuccess(`Item "${item.item_name}" eliminado del inventario.`);
      
    } catch (error: any) {
      console.error('Error al eliminar item:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error desconocido al eliminar item';
      
      onError(`Error al eliminar item: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-red-600">Eliminar Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold mb-2">{item.item_name}</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Categoría:</span>
              <span className="text-white capitalize">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cantidad:</span>
              <span className="text-red-400">{item.quantity} unidades</span>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">¿Estás seguro?</span>
          </div>
          <p className="text-red-300 text-sm">
            Esta acción eliminará permanentemente el item de tu inventario. No se puede deshacer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Eliminando...' : 'Eliminar Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para añadir items
function AddItemModal({
  onClose,
  onSuccess,
  onError
}: {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('weapon');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'weapon', label: 'Weapon' },
    { value: 'buff', label: 'Buff' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim()) {
      onError('El nombre del item es requerido');
      return;
    }

    if (quantity <= 0) {
      onError('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        itemName: itemName.trim(),
        category: category,
        quantity: quantity
      };

      await api.post('/sponsor/add-item', payload);
      
      onSuccess(`¡Éxito! ${quantity} unidad(es) de "${itemName}" añadida(s) a tu inventario.`);
      
    } catch (error: any) {
      console.error('Error al añadir item:', error);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error desconocido al añadir item';
      
      onError(`Error al añadir item: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-red-600">Añadir Item al Inventario</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Nombre del Item:</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
              placeholder="Ej: NeuroHack X, CyberKatana..."
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Categoría:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Cantidad:</label>
              <input
                type="number"
                min="1"
                max="999"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded">
            <h5 className="text-white font-semibold mb-2">Vista Previa</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white">{itemName || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Categoría:</span>
                <span className="text-white">{categories.find(c => c.value === category)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cantidad:</span>
                <span className="text-red-400">{quantity} unidad(es)</span>
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
              disabled={loading || !itemName.trim() || quantity <= 0}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Añadiendo...' : 'Añadir Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal de venta (mismo código anterior)
function SellModal({
  item,
  onClose,
  onSuccess,
  onError
}: {
  item: InventoryItem;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  const [price, setPrice] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (price <= 0) {
      onError('El precio debe ser mayor a 0');
      return;
    }

    if (quantity <= 0 || quantity > item.quantity) {
      onError(`Cantidad inválida. Tienes ${item.quantity} unidades disponibles.`);
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        item_id: item.id,
        price: price,
        quantity: quantity
      };

      await api.post('/sponsor/blackmarket/offer-item', payload);
      
      onSuccess(`¡Éxito! ${quantity} unidad(es) de "${item.item_name}" puesta(s) en venta por $${price} cada una.`);
      
    } catch (error: any) {
      console.error('Error al vender item:', error);
      
      const backendError = error.response?.data?.error || 'Error desconocido';
      onError(`Error del servidor: ${backendError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-red-600">Vender Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold mb-2">{item.item_name}</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Categoría:</span>
              <span className="text-white capitalize">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Disponible:</span>
              <span className="text-green-400">{item.quantity} unidades</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Cantidad a vender:</label>
            <input
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Máximo: {item.quantity} unidades</p>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Precio por unidad:</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                min="1"
                step="1"
                value={price}
                onChange={(e) => setPrice(parseInt(e.target.value) || 1)}
                className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                placeholder="Ingresa el precio"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Precio mínimo: $1</p>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#333] rounded">
            <h5 className="text-white font-semibold mb-2">Resumen de Venta</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cantidad:</span>
                <span className="text-white">{quantity} unidad(es)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Precio por unidad:</span>
                <span className="text-white">${price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#444] pt-2">
                <span className="text-gray-400">Total a recibir:</span>
                <span className="text-green-400 font-bold">${(price * quantity).toLocaleString()}</span>
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
              disabled={loading || price <= 0 || quantity <= 0 || quantity > item.quantity}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {loading ? 'Vendiendo...' : 'Poner en Venta'}
            </button>
          </div>
        </form>
      </div>
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
  const isError = message.toLowerCase().includes('error') || message.toLowerCase().includes('no tienes');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isError ? 'bg-red-900/20 border border-red-600' : 'bg-green-red/20 border border-red-600'
          }`}>
            {isError ? (
              <X className="w-8 h-8 text-red-400" />
            ) : (
              <Gift className="w-8 h-8 text-red-400" />
            )}
          </div>
          
          <h3 className={`text-xl font-semibold mb-4 ${isError ? 'text-red-400' : 'text-red-400'}`}>
            {isError ? 'Error' : '¡Éxito!'}
          </h3>
          
          <p className="text-gray-300 mb-6 whitespace-pre-line">
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
