import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    id: '01',
    icon: 'search',
    title: 'Explora propiedades',
    description:
      'Navega nuestro catálogo de propiedades exclusivas en toda la República Dominicana. Usa los filtros de precio, tipo y zona para encontrar opciones que se ajusten a lo que buscas.',
    tips: [
      'Filtra por precio, tipo de propiedad y zona',
      'Guarda tus favoritas para comparar después',
      'Revisa las fotos y el mapa de ubicación',
    ],
  },
  {
    id: '02',
    icon: 'real_estate_agent',
    title: 'Conecta con el agente',
    description:
      'Cada propiedad en Melior tiene un agente certificado detrás. Con un solo click puedes enviarle un mensaje, agendar una visita o contactarlo directamente por WhatsApp.',
    tips: [
      'El agente responde en menos de 24 horas',
      'Puedes agendar una visita presencial o virtual',
      'Consulta sin compromiso — es totalmente gratis',
    ],
  },
  {
    id: '03',
    icon: 'handshake',
    title: 'El agente te guía',
    description:
      'Una vez conectado, el agente se encarga de acompañarte en todo el proceso: visitas, negociación, documentación y cierre. Tú solo decides, ellos hacen el resto.',
    tips: [
      'El agente conoce el mercado local a profundidad',
      'Te ayuda a negociar el mejor precio',
      'Coordina visitas según tu disponibilidad',
    ],
  },
];

function formatRD(n: number) {
  return `RD$${Math.round(n).toLocaleString('es-DO')}`;
}

const MortgageCalculator = () => {
  const [price,    setPrice]    = useState(5000000);
  const [down,     setDown]     = useState(20);
  const [rate,     setRate]     = useState(12);
  const [years,    setYears]    = useState(20);
  const [currency, setCurrency] = useState<'RD' | 'USD'>('RD');

  const fx = 57;
  const priceRD  = currency === 'USD' ? price * fx : price;
  const loanAmt  = priceRD * (1 - down / 100);
  const downAmt  = priceRD * (down / 100);
  const r        = rate / 100 / 12;
  const n        = years * 12;

  const monthly = useMemo(() => {
    if (r === 0) return loanAmt / n;
    return loanAmt * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmt, r, n]);

  const totalPaid     = monthly * n;
  const totalInterest = totalPaid - loanAmt;

  return (
    <section className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
      <div className="card overflow-hidden p-0">
        <div className="bg-brand-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>calculate</span>
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white">Calculadora de Hipoteca</h2>
              <p className="text-sm text-brand-100">Estimado referencial de cuota mensual</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex gap-2">
            {(['RD', 'USD'] as const).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  currency === c
                    ? 'bg-brand-600 text-white shadow'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400'
                }`}
              >
                {c === 'RD' ? 'Pesos (RD$)' : 'Dólares (US$)'}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Precio de la propiedad
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {currency === 'RD' ? 'RD$' : 'US$'}
                </span>
                <input
                  type="number" min={0} value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Cuota inicial: <span className="text-brand-600">{down}%</span>
                <span className="ml-2 text-xs font-normal text-slate-400">({formatRD(downAmt)})</span>
              </label>
              <input type="range" min={5} max={60} step={1} value={down}
                onChange={e => setDown(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-600" />
              <div className="mt-1 flex justify-between text-xs text-slate-400"><span>5%</span><span>60%</span></div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tasa de interés anual: <span className="text-brand-600">{rate}%</span>
              </label>
              <input type="range" min={6} max={24} step={0.5} value={rate}
                onChange={e => setRate(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-600" />
              <div className="mt-1 flex justify-between text-xs text-slate-400"><span>6%</span><span>24%</span></div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Plazo: <span className="text-brand-600">{years} años</span>
              </label>
              <input type="range" min={5} max={30} step={5} value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-100 accent-brand-600" />
              <div className="mt-1 flex justify-between text-xs text-slate-400"><span>5 años</span><span>30 años</span></div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-brand-50 p-5 dark:bg-brand-950/40">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cuota mensual</p>
              <p className="mt-1 font-heading text-xl font-extrabold text-brand-700 dark:text-brand-300">{formatRD(monthly)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Monto préstamo</p>
              <p className="mt-1 font-heading text-xl font-extrabold text-slate-700 dark:text-slate-300">{formatRD(loanAmt)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total intereses</p>
              <p className="mt-1 font-heading text-xl font-extrabold text-slate-700 dark:text-slate-300">{formatRD(totalInterest)}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            * Estimado referencial. Consulta las condiciones exactas con tu banco.
          </p>
        </div>
      </div>
    </section>
  );
};

const BuyingGuidePage = () => {
  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-600 px-4 py-16 sm:py-20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500 opacity-30" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-700 opacity-30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge bg-white/20 text-white border border-white/20 mb-4">
            🏡 Así funciona Melior
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            Tu próxima propiedad, a tres pasos
          </h1>
          <p className="mt-3 text-brand-100">
            En Melior nos encargamos de conectarte con el agente ideal. Tú explorar, nosotros conectamos, el agente cierra.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <details
              key={step.id}
              className="card group overflow-hidden"
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center gap-4 p-5 list-none outline-none [&::-webkit-details-marker]:hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                </div>
                <div className="flex-grow">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">PASO {step.id}</span>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-slate-400 transition-transform duration-200 group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="material-symbols-outlined text-brand-500 text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Mortgage calculator */}
      <MortgageCalculator />

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="card flex flex-col items-center gap-5 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>real_estate_agent</span>
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¿Listo para encontrar tu propiedad?</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Explora el catálogo y conecta con un agente en minutos. Sin burocracia, sin rodeos.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/propiedades" className="btn-primary">
              Ver propiedades
            </Link>
            <Link to="/contacto" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Hablar con un agente
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BuyingGuidePage;
