'use client';
import { useState, useEffect } from 'react';
import { Package, Search, Filter, Gift, X, DollarSign, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  category: string;
  dictator_id: string;
}

export default function DictatorInventarioPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      console.log('Cargando inventario del dictador...');
      
      const response = await api.get('/dictator/inventory');
      
      console.log('Inventario - Data recibida:', response.data);
      
      // Mapear los items directamente (el backend ya filtra por dictador)
      const mappedItems = response.data.map((item: any) => ({
        id: item.id,
        item_name: item.item_name || 'Item sin nombre',
        quantity: Number(item.quantity) || 0,
        category: item.category || 'general',
        dictator_id: item.dictator_id || ''
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

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await api.delete('/dictator/delete-item', {
        data: { item_id: selectedItem.id }
      });
      
      setItems(prev => prev.filter(item => item.id !== selectedItem.id));
      setSuccessMessage(`Item "${selectedItem.item_name}" eliminado del inventario.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setSuccessMessage(`Error al eliminar item: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    } finally {
      setShowDeleteModal(false);
      setSelectedItem(null);
    }
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
          <p className="text-gray-400">Gestiona tus items y buffs</p>
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

      {/* Estadísticas - IDÉNTICAS A SPONSORS */}
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
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-semibold">Total Items</span>
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

      {/* Filtros - IDÉNTICOS A SPONSORS */}
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

      {/* Lista de Items - IDÉNTICA A SPONSORS */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            {items.length === 0 ? 'Tu inventario está vacío' : 'No se encontraron items'}
          </h3>
          <p className="text-gray-500 mb-4">
            {items.length === 0 
              ? 'Compra items en el Black Market para equipar a tus gladiadores'
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

// Componente de tarjeta de item - IDÉNTICO A SPONSORS pero sin botón vender
function ItemCard({
  item,
  onDelete
}: {
  item: InventoryItem;
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

      {/* Botón de eliminar - IDÉNTICO LAYOUT A SPONSORS */}
      <div className="flex gap-2">
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

// Modal para eliminar items - IDÉNTICO A SPONSORS
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
      await api.delete('/dictator/delete-item', {
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

// Modal para añadir items - IDÉNTICO A SPONSORS pero con más categorías
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

      await api.post('/dictator/add-item', payload);
      
      onSuccess(`${quantity} unidad(es) de "${itemName}" añadida(s) a tu inventario.`);
      
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

// Modal de éxito/error - IDÉNTICO A SPONSORS
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
              <Gift className="w-8 h-8 text-green-400" />
            )}
          </div>
          
          <h3 className={`text-xl font-semibold mb-4 ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {isError ? 'Error' : 'Operación Exitosa'}
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
