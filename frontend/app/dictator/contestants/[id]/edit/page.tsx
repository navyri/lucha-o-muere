'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Crown, ArrowLeft, Save, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Contestant {
  id: string;
  name: string;
  health: number;
  strength: number;
  agility: number;
  status: 'Alive' | 'Injured' | 'Dead';
  wins: number;
  losses: number;
  dictator_id: string;
  nickname?: string;
  released?: boolean;
}

export default function EditContestantPage() {
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    health: 100,
    strength: 50,
    agility: 50,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchContestant();
  }, []);

  const fetchContestant = async () => {
    try {
      // Buscar el contestant específico en la lista (ya que no hay endpoint individual)
      const response = await api.get('/dictator/contestants');
      const contestants = response.data;
      const found = contestants.find((c: Contestant) => c.id === params.id);
      
      if (found) {
        setContestant(found);
        setFormData({
          name: found.name,
          nickname: found.nickname || '',
          health: found.health,
          strength: found.strength,
          agility: found.agility,
        });
      } else {
        setError('Contestant no encontrado');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar contestant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/dictator/contestants/${params.id}`, formData);
      setSuccessMessage(`Contestant "${formData.name}" actualizado exitosamente.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar contestant');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTotalPower = () => {
    return formData.health + formData.strength + formData.agility;
  };

  const getOriginalPower = () => {
    if (!contestant) return 0;
    return contestant.health + contestant.strength + contestant.agility;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando contestant...</div>
      </div>
    );
  }

  if (!contestant) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-400 mb-4">Contestant no encontrado</div>
        <Link
          href="/dictator/contestants"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Contestants
        </Link>
      </div>
    );
  }

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
          Editar Contestant
        </h1>
        <div>
          <p className="text-gray-400">Modifica las estadísticas de</p>
          <h2 className="text-xl font-semibold text-white">{contestant.name}</h2>
          {contestant.nickname && (
            <p className="text-gray-300 text-sm italic">"{contestant.nickname}"</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Contestant */}
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Información del Contestant</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <span className="block text-gray-400 text-sm">Estado</span>
              <span className={`font-semibold ${
                contestant.status === 'Alive' ? 'text-green-400' :
                contestant.status === 'Injured' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {contestant.status}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-gray-400 text-sm">Victorias</span>
              <span className="font-semibold text-green-400">{contestant.wins}</span>
            </div>
            <div className="text-center">
              <span className="block text-gray-400 text-sm">Derrotas</span>
              <span className="font-semibold text-red-400">{contestant.losses}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Nombre del Contestant</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 bg-[#1a1a1a] border border-[#333] text-white rounded focus:border-red-600 outline-none"
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

        {/* Estadísticas */}
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Estadísticas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-400 mb-2">
                Salud: {formData.health}
                <span className="text-xs ml-2 text-gray-500">
                  (Original: {contestant.health})
                </span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={formData.health}
                onChange={(e) => handleInputChange('health', parseInt(e.target.value))}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">
                Fuerza: {formData.strength}
                <span className="text-xs ml-2 text-gray-500">
                  (Original: {contestant.strength})
                </span>
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
                <span className="text-xs ml-2 text-gray-500">
                  (Original: {contestant.agility})
                </span>
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

          <div className="mt-6 p-4 bg-[#1a1a1a] border border-[#333] rounded">
            <h3 className="text-lg font-semibold text-white mb-2">Comparación de Poder</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Poder Original:</span>
                  <span className="text-yellow-400">{getOriginalPower()}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Poder Nuevo:</span>
                  <span className="text-yellow-400 font-bold">{getTotalPower()}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#444]">
              <div className="flex justify-between">
                <span className="text-gray-400">Diferencia:</span>
                <span className={`font-bold ${
                  getTotalPower() > getOriginalPower() ? 'text-green-400' : 
                  getTotalPower() < getOriginalPower() ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {getTotalPower() > getOriginalPower() ? '+' : ''}{getTotalPower() - getOriginalPower()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <Link
            href="/dictator/contestants"
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
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
            Contestant Actualizado
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
