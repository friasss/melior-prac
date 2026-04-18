import { useState } from 'react';
import { submitInquiry } from '../services/api';

const SUBJECTS = [
  'Comprar una propiedad',
  'Alquilar una propiedad',
  'Vender mi propiedad',
  'Inversión inmobiliaria',
  'Otro',
] as const;

const ContactPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [subject, setSubject]     = useState<string>(SUBJECTS[0]);
  const [message, setMessage]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await submitInquiry({ firstName, lastName, email, phone, subject, message });
      setSent(true);
      setFirstName(''); setLastName(''); setEmail('');
      setPhone(''); setMessage('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el mensaje. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 sm:py-20">
        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">Contáctanos</h1>
          <p className="mt-3 text-slate-300">Estamos aquí para ayudarte a encontrar la propiedad perfecta. Escríbenos o llámanos.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact form */}
          <div className="card p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Envíanos un mensaje</h2>

            {sent ? (
              <div className="mt-6 flex flex-col items-center rounded-2xl bg-emerald-50 py-10 text-center dark:bg-emerald-950">
                <span className="material-symbols-outlined text-5xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <h3 className="mt-4 font-heading text-lg font-bold text-emerald-700 dark:text-emerald-300">¡Mensaje enviado!</h3>
                <p className="mt-2 max-w-xs text-sm text-emerald-600 dark:text-emerald-400">Nos pondremos en contacto contigo en las próximas horas.</p>
                <button onClick={() => setSent(false)} className="btn-secondary mt-6">Enviar otro mensaje</button>
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Tu nombre" required className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" required className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuemail@ejemplo.com" required className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="809-000-0000" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">¿En qué te podemos ayudar?</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Cuéntanos más sobre lo que buscas..." required className="input-field resize-none" />
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6 lg:col-span-2">
            {[
              { icon: 'location_on', title: 'Oficina Principal',   lines: ['Av. Abraham Lincoln #1001', 'Torre Empresarial, Piso 12', 'Santo Domingo, DN'] },
              { icon: 'call',        title: 'Teléfono',            lines: ['+1 (809) 555-0100', '+1 (809) 555-0200'] },
              { icon: 'mail',        title: 'Correo',              lines: ['info@melior.com.do', 'ventas@melior.com.do'] },
              { icon: 'schedule',    title: 'Horario',             lines: ['Lun - Vie: 8:00 AM - 6:00 PM', 'Sáb: 9:00 AM - 1:00 PM'] },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-slate-500 dark:text-slate-400">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
