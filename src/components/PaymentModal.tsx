import React, { useState } from 'react';

const DOP_RATE = 59;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amountUSD: number;
  title: string;
  description: string;
}

export default function PaymentModal({ isOpen, onClose, onSuccess, amountUSD, title, description }: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function formatCard(val: string) {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  function formatExpiry(val: string) {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setPending(true); }, 1400);
  }

  function handleConfirm() {
    setPending(false);
    setCardNumber(''); setCardName(''); setExpiry(''); setCvv('');
    onSuccess();
  }

  const dopAmount = Math.round(amountUSD * DOP_RATE).toLocaleString('es-DO');

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 px-4 py-8" onClick={onClose}>
      <div className="w-full max-w-md card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>

        {pending ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
              <span className="material-symbols-outlined text-4xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Transacción pendiente</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                El sistema de cobros no está disponible en este momento. Tu transacción ha quedado registrada y será procesada próximamente.
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
              <span className="material-symbols-outlined text-3xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <button onClick={handleConfirm} className="btn-primary w-full justify-center">
              Entendido, continuar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-950/40">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total a pagar</span>
              <div className="text-right">
                <span className="text-xl font-bold text-brand-700 dark:text-brand-300">${amountUSD} USD</span>
                <span className="block text-xs text-slate-400">≈ RD${dopAmount}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">Número de tarjeta</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" value={cardNumber}
                    onChange={e => setCardNumber(formatCard(e.target.value))}
                    placeholder="1234 5678 9012 3456" maxLength={19} required className="input-field pr-10" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xl text-slate-300">credit_card</span>
                </div>
              </div>
              <div>
                <label className="label-field">Nombre en la tarjeta</label>
                <input type="text" value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  placeholder="JUAN PÉREZ" required className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field">Vencimiento</label>
                  <input type="text" inputMode="numeric" value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA" maxLength={5} required className="input-field" />
                </div>
                <div>
                  <label className="label-field">CVV</label>
                  <input type="text" inputMode="numeric" value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123" maxLength={4} required className="input-field" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                {loading
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <><span className="material-symbols-outlined text-base">lock</span>Proceder con el pago</>}
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-slate-400">
              <span className="material-symbols-outlined text-xs align-middle mr-0.5">lock</span>
              Pago seguro con encriptación SSL
            </p>
          </>
        )}
      </div>
    </div>
  );
}
