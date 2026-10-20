'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Building, User, CheckCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface User {
  id: string;
  role: 'Dictator' | 'Sponsor';
  username: string;
}

interface ActivationForm {
  name?: string;
  territory?: string;
  company_name?: string;
}

export default function ActivatePage() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ActivationForm>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (!payload.role || (payload.role !== 'Dictator' && payload.role !== 'Sponsor')) {
        router.push('/dashboard');
        return;
      }

      setUser({
        id: payload.id,
        role: payload.role,
        username: payload.username || 'Usuario'
      });
    } catch (error) {
      console.error('Token inválido:', error);
      localStorage.removeItem('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/auth/activate', formData);
      
      // Mostrar paso de éxito
      setStep(3);
      
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al activar cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ActivationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToStep2 = (): boolean => {
    if (user?.role === 'Dictator') {
      return Boolean(formData.name?.trim() && formData.territory?.trim());
    }
    if (user?.role === 'Sponsor') {
      return Boolean(formData.company_name?.trim());
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a]">
        <div className="text-red-600">Verificando estado de cuenta...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            ¡Bienvenido a Lucha o Muere!
          </h1>
          <p className="text-gray-400">
            Activa tu cuenta de {user.role} para comenzar tu aventura
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= 1 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-600 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-red-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= 2 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-600 text-gray-400'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-red-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= 3 ? 'border-red-600 bg-red-600 text-white' : 'border-gray-600 text-gray-400'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-8">
          {step === 1 && (
            <Step1Content
              user={user}
              formData={formData}
              onInputChange={handleInputChange}
              onNext={() => setStep(2)}
              canProceed={canProceedToStep2()}
              error={error}
            />
          )}

          {step === 2 && (
            <Step2Content
              user={user}
              formData={formData}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={error}
            />
          )}

          {step === 3 && (
            <Step3Content user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

// Paso 1: Información básica
function Step1Content({
  user,
  formData,
  onInputChange,
  onNext,
  canProceed,
  error
}: {
  user: User;
  formData: ActivationForm;
  onInputChange: (field: keyof ActivationForm, value: string) => void;
  onNext: () => void;
  canProceed: boolean;
  error: string;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {user.role === 'Dictator' ? (
            <Crown className="w-16 h-16 text-red-600" />
          ) : (
            <Building className="w-16 h-16 text-green-600" />
          )}
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Configuración de {user.role}
        </h2>
        <p className="text-gray-400">
          {user.role === 'Dictator' 
            ? 'Establece tu identidad como dictador y reclama tu territorio'
            : 'Configura tu empresa patrocinadora'
          }
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {user.role === 'Dictator' && (
          <>
            <div>
              <label className="block text-gray-400 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre del Dictador
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => onInputChange('name', e.target.value)}
                className="w-full p-4 bg-[#1a1a1a] border border-[#333] text-white rounded-lg focus:border-red-600 outline-none"
                placeholder="Ej: Caesar Augustus"
                required
              />
              <p className="text-gray-500 text-sm mt-1">
                Este será tu nombre en el arena
              </p>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">
                <Crown className="w-4 h-4 inline mr-2" />
                Territorio
              </label>
              <input
                type="text"
                value={formData.territory || ''}
                onChange={(e) => onInputChange('territory', e.target.value)}
                className="w-full p-4 bg-[#1a1a1a] border border-[#333] text-white rounded-lg focus:border-red-600 outline-none"
                placeholder="Ej: Imperio Romano del Norte"
                required
              />
              <p className="text-gray-500 text-sm mt-1">
                El territorio que controlas
              </p>
            </div>
          </>
        )}

        {user.role === 'Sponsor' && (
          <div>
            <label className="block text-gray-400 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={formData.company_name || ''}
              onChange={(e) => onInputChange('company_name', e.target.value)}
              className="w-full p-4 bg-[#1a1a1a] border border-[#333] text-white rounded-lg focus:border-red-600 outline-none"
              placeholder="Ej: Gladius Corp"
              required
            />
            <p className="text-gray-500 text-sm mt-1">
              El nombre de tu empresa patrocinadora
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// Paso 2: Confirmación
function Step2Content({
  user,
  formData,
  onBack,
  onSubmit,
  submitting,
  error
}: {
  user: User;
  formData: ActivationForm;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Confirma tu Información
        </h2>
        <p className="text-gray-400">
          Revisa los datos antes de activar tu cuenta
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-600 rounded text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          Resumen de tu Perfil
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Usuario:</span>
            <span className="text-white">{user.username}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Rol:</span>
            <span className="text-white">{user.role}</span>
          </div>

          {user.role === 'Dictator' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Nombre:</span>
                <span className="text-white">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Territorio:</span>
                <span className="text-white">{formData.territory}</span>
              </div>
            </>
          )}

          {user.role === 'Sponsor' && (
            <div className="flex justify-between">
              <span className="text-gray-400">Empresa:</span>
              <span className="text-white">{formData.company_name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
        <h4 className="text-red-400 font-semibold mb-2">
          {user.role === 'Dictator' ? 'Como Dictador podrás:' : 'Como Sponsor podrás:'}
        </h4>
        <ul className="text-red-300 text-sm space-y-1">
          {user.role === 'Dictator' ? (
            <>
              <li>• Crear y gestionar gladiadores</li>
              <li>• Proponer batallas épicas</li>
              <li>• Comprar items en el mercado negro</li>
              <li>• Apostar en batallas</li>
            </>
          ) : (
            <>
              <li>• Patrocinar gladiadores con items</li>
              <li>• Vender items en el mercado negro</li>
              <li>• Invertir en batallas</li>
              <li>• Gestionar tu inventario</li>
            </>
          )}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-4 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded-lg transition-colors"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {submitting ? 'Activando...' : 'Activar Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Paso 3: Éxito
function Step3Content({ user }: { user: User }) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="w-24 h-24 text-green-400" />
      </div>
      
      <div>
        <h2 className="text-3xl font-semibold text-white mb-2">
          ¡Cuenta Activada!
        </h2>
        <p className="text-gray-400">
          Tu cuenta de {user.role} ha sido activada exitosamente
        </p>
      </div>

      <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">
          ¡Bienvenido al Arena!
        </h3>
        <p className="text-red-300 text-sm">
          {user.role === 'Dictator' 
            ? 'Ya puedes comenzar a crear tus gladiadores y conquistar el arena.'
            : 'Ya puedes comenzar a patrocinar gladiadores y gestionar tu empresa.'
          }
        </p>
      </div>

      <div className="text-gray-400 text-sm">
        Serás redirigido al dashboard en unos segundos...
      </div>
    </div>
  );
}
