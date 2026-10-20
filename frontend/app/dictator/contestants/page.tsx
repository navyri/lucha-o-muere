'use client';
import { useEffect, useState } from 'react';
import { Plus, Crown, Edit, Trash2, Gift, Zap, X, CheckCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import GiveItemModal from '@/app/components/features/dictador/GiveItemModal';
import ApplyBuffModal from '@/app/components/features/dictador/ApplyBuffModal';
import ContestantDetailsModal from '@/app/components/features/dictador/ContestantDetailsModal';

// Interface corregido según la base de datos original
interface Contestant {
  id: string;
  name: string;
  health: number;
  strength: number;
  agility: number;
  status: 'Alive' | 'Dead' | 'Injured';
  wins: number;
  losses: number;
  dictator_id: string;
  nickname?: string;
  released?: boolean;
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    try {
      const response = await api.get('/dictator/contestants');
      setContestants(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cargar contestants');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContestant = (contestant: Contestant) => {
    setSelectedContestant(contestant);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedContestant) return;

    try {
      await api.delete(`/dictator/Release-contestants/${selectedContestant.id}`);
      setContestants(prev => prev.filter(c => c.id !== selectedContestant.id));
      setSuccessMessage(`Contestant "${selectedContestant.name}" ha sido liberado exitosamente.`);
      setShowSuccessModal(true);
    } catch (error: any) {
      setSuccessMessage(`Error al liberar contestant: ${error.response?.data?.error || 'Error desconocido'}`);
      setShowSuccessModal(true);
    } finally {
      setShowConfirmModal(false);
      setSelectedContestant(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-red-600">Cargando contestants...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <Crown className="w-8 h-8" />
            Mis Contestants
          </h1>
          <p className="text-gray-400">Gestiona tus gladiadores</p>
        </div>
        <Link
          href="/dictator/contestants/create"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Contestant
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      {contestants.length === 0 ? (
        <div className="text-center py-12">
          <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No tienes contestants
          </h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer gladiador para comenzar a competir
          </p>
          <Link
            href="/dictator/contestants/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Contestant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              contestant={contestant}
              onDelete={handleDeleteContestant}
              onRefresh={fetchContestants}
            />
          ))}
        </div>
      )}

      {showConfirmModal && selectedContestant && (
        <ConfirmDeleteModal
          key={`confirm-${selectedContestant.id}`}
          contestant={selectedContestant}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedContestant(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          key={`success-${Date.now()}`}
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

function ContestantCard({ 
  contestant, 
  onDelete,
  onRefresh
}: { 
  contestant: Contestant; 
  onDelete: (contestant: Contestant) => void;
  onRefresh: () => void;
}) {
  const [showGiveItemModal, setShowGiveItemModal] = useState(false);
  const [showApplyBuffModal, setShowApplyBuffModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Alive': return 'text-green-400';
      case 'Injured': return 'text-yellow-400';
      case 'Dead': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Alive': return 'bg-green-900/20 border-green-600';
      case 'Injured': return 'bg-yellow-900/20 border-yellow-600';
      case 'Dead': return 'bg-red-900/20 border-red-600';
      default: return 'bg-gray-900/20 border-gray-600';
    }
  };

  return (
    <>
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 hover:border-red-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-red-600 mb-1">{contestant.name}</h3>
            {contestant.nickname && (
              <p className="text-gray-300 text-sm italic">"{contestant.nickname}"</p>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs border ${getStatusBg(contestant.status)} ${getStatusColor(contestant.status)}`}>
            {contestant.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Salud:</span>
            <span className="text-white">{contestant.health}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Fuerza:</span>
            <span className="text-white">{contestant.strength}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Agilidad:</span>
            <span className="text-white">{contestant.agility}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Poder Total:</span>
            <span className="text-yellow-400">{contestant.strength + contestant.agility + contestant.health}</span>
          </div>
        </div>

        <div className="flex justify-between text-sm mb-4">
          <span className="text-green-400">Victorias: {contestant.wins}</span>
          <span className="text-red-400">Derrotas: {contestant.losses}</span>
        </div>

        {/* Botones en una sola fila */}
        <div className="flex gap-2">
          <Link
            href={`/dictator/contestants/${contestant.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
          >
            <Edit className="w-3 h-3" />
            Editar
          </Link>
          <button
            onClick={() => setShowDetailsModal(true)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
            title="Ver Detalles"
          >
            <Eye className="w-3 h-3" />
            Detalles
          </button>
          <button
            onClick={() => setShowGiveItemModal(true)}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
            title="Dar Weapon"
          >
            <Gift className="w-3 h-3" />
          </button>
          <button
            onClick={() => setShowApplyBuffModal(true)}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
            title="Aplicar Buff"
          >
            <Zap className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(contestant)}
            className="flex items-center justify-center gap-1 px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
            title="Liberar"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Modales */}
      {showGiveItemModal && (
        <GiveItemModal
          key={`give-${contestant.id}`}
          isOpen={showGiveItemModal}
          onClose={() => setShowGiveItemModal(false)}
          contestantId={contestant.id}
          contestantName={contestant.name}
          onSuccess={() => {
            setShowGiveItemModal(false);
            onRefresh();
          }}
        />
      )}

      {showApplyBuffModal && (
        <ApplyBuffModal
          key={`buff-${contestant.id}`}
          isOpen={showApplyBuffModal}
          onClose={() => setShowApplyBuffModal(false)}
          contestantId={contestant.id}
          contestantName={contestant.name}
          onSuccess={() => {
            setShowApplyBuffModal(false);
            onRefresh();
          }}
        />
      )}

      {showDetailsModal && (
        <ContestantDetailsModal
          key={`details-${contestant.id}`}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          contestantId={contestant.id}
          contestantName={contestant.name}
        />
      )}
    </>
  );
}

// Los demás componentes (ConfirmDeleteModal y SuccessModal) permanecen igual...
function ConfirmDeleteModal({
  contestant,
  onClose,
  onConfirm
}: {
  contestant: Contestant;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-red-600">Liberar Contestant</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#1a1a1a] border border-[#333] rounded">
          <h4 className="text-white font-semibold mb-2">{contestant.name}</h4>
          {contestant.nickname && (
            <p className="text-gray-300 text-sm italic mb-2">"{contestant.nickname}"</p>
          )}
          <div className="text-sm space-y-1">
            <div className="text-gray-400">
              Estado: {contestant.status}
            </div>
            <div className="text-gray-400">
              Récord: {contestant.wins}W - {contestant.losses}L
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-red-900/20 border border-red-600 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">¿Estás seguro?</span>
          </div>
          <p className="text-red-300 text-sm">
            Esta acción liberará permanentemente al contestant. No se puede deshacer.
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
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Liberando...' : 'Liberar Contestant'}
          </button>
        </div>
      </div>
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
