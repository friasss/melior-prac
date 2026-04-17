import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

export default function LoginPromptModal({ isOpen, onClose, action = 'realizar esta acción' }: Props) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-card-dark animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-brand-700" />

        <div className="p-6">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
            <span
              className="material-symbols-outlined text-3xl text-brand-600 dark:text-brand-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>

          {/* Text */}
          <h3 className="text-center font-heading text-lg font-bold text-slate-900 dark:text-white">
            Inicia sesión primero
          </h3>
          <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
            Necesitas una cuenta para poder {action}.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => { onClose(); navigate('/login'); }}
              className="btn-primary w-full justify-center py-3"
            >
              <span className="material-symbols-outlined text-base">login</span>
              Iniciar Sesión
            </button>
            <button
              onClick={() => { onClose(); navigate('/login?tab=register'); }}
              className="btn-secondary w-full justify-center py-3"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Crear cuenta gratis
            </button>
            <button
              onClick={onClose}
              className="text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
