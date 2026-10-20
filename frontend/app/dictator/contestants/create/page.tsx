'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function CreateContestantPage() {
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    health: 100,
    strength: 50,
    agility: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/dictator/add-contestants', formData);
      setSuccessMessage(`Contestant "${formData.name}" creado exitosamente.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al crear contestant');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTotalPower = () => {
    return formData.health + formData.strength + formData.agility;
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href="/dictator/contestants"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Contestants
        </Link>
        <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
          <Crown className="w-8 h-8" />
          Crear Nuevo Contestant
        </h1>
        <p className="text-gray-400">Crea un nuevo gladiador para tu colección</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Información Básica</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Nombre del Contestant</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                placeholder="Ej: Gladius Maximus"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Apodo (Opcional)</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
                placeholder="Ej: El Destructor"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Estadísticas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">
                Salud: {formData.health}
              </label>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">
                Fuerza: {formData.strength}
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={formData.strength}
                onChange={(e) => handleInputChange('strength', parseInt(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">
                Agilidad: {formData.agility}
              </label>
              <input
                type="range"
                min="30"
                max="100"
                value={formData.agility}
                onChange={(e) => handleInputChange('agility', parseInt(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>30</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded">
            <p className="text-red-300 text-sm">
              <strong>Nota:</strong> Todos los contestants comienzan con 100 puntos de salud. 
              La salud solo cambia durante las batallas.
            </p>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Resumen</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white">{formData.name || 'Sin nombre'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Apodo:</span>
                <span className="text-white">{formData.nickname || 'Sin apodo'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Salud:</span>
                <span className="text-green-400">{formData.health}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fuerza:</span>
                <span className="text-white">{formData.strength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Agilidad:</span>
                <span className="text-white">{formData.agility}</span>
              </div>
              <div className="flex justify-between border-t border-[#444] pt-1">
                <span className="text-gray-400">Poder Total:</span>
                <span className="text-yellow-400 font-bold">{getTotalPower()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/dictator/contestants"
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            {loading ? 'Creando...' : 'Crear Contestant'}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessMessage('');
            router.push('/dictator/contestants');
          }}
        />
      )}
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-900/20 border border-green-600">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          
          <h3 className="text-xl font-semibold mb-4 text-green-400">
            Contestant Creado
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
