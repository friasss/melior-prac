import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onDone: () => void;
}

const CompleteProfileModal = ({ onDone }: Props) => {
  const { completeProfile, user } = useAuth();
  const [role, setRole] = useState<'CLIENT' | 'AGENT'>('CLIENT');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Nombre y apellido son requeridos.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await completeProfile({ firstName, lastName, phone: phone || undefined, role });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-card-dark">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600/10">
          <span className="material-symbols-outlined text-3xl text-brand-600">person_add</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Completa tu perfil</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Solo necesitamos un par de datos más para empezar.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            ¿Cómo usarás Melior?
          </label>
          <div className="flex h-11 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setRole('CLIENT')}
              className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'CLIENT'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-base">person</span>
              Soy Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('AGENT')}
              className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'AGENT'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-base">home_work</span>
              Soy Agente
            </button>
          </div>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
            <input
              type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre" required className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
            <input
              type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              placeholder="Tu apellido" required className="input-field"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Teléfono <span className="text-slate-400">(opcional)</span>
          </label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="809-000-0000" className="input-field"
          />
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </span>
          ) : (
            'Continuar'
          )}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfileModal;
