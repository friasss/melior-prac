import { Link } from 'react-router-dom';

const steps = [
  {
    id: '01',
    icon: 'account_balance',
    title: 'Definición de Presupuesto y Pre-aprobación',
    description:
      'La pre-aprobación bancaria es clave para entender tu capacidad de compra. Reúne tus documentos financieros iniciales y utiliza nuestra calculadora de hipotecas para tener una idea clara de tu presupuesto.',
    tips: ['Solicita tu reporte de crédito', 'Reúne comprobantes de ingresos de 3 meses', 'Calcula tu cuota inicial (típicamente 20-30%)'],
  },
  {
    id: '02',
    icon: 'search',
    title: 'Búsqueda y Selección de la Propiedad',
    description:
      'Define tus criterios de búsqueda: ubicación, tipo de propiedad, presupuesto. Un agente inmobiliario profesional te ayudará a encontrar opciones que se ajusten a tus necesidades.',
    tips: ['Define tus prioridades (ubicación vs. tamaño)', 'Visita al menos 5 propiedades', 'Compara precios por metro cuadrado'],
  },
  {
    id: '03',
    icon: 'gavel',
    title: 'Proceso Legal y Debida Diligencia',
    description:
      'Tu abogado revisará documentos clave como el Título de Propiedad, la Certificación de Estado Jurídico, y verificará que no existan gravámenes o impedimentos legales.',
    tips: ['Contrata un abogado inmobiliario', 'Verifica el título en el Registro de Títulos', 'Solicita certificación de estado jurídico'],
  },
  {
    id: '04',
    icon: 'edit_document',
    title: 'Firma y Cierre',
    description:
      'El paso final incluye la firma del contrato de promesa de venta, el acto de venta final ante notario, el registro del inmueble a tu nombre y la entrega de llaves.',
    tips: ['Revisa todos los documentos antes de firmar', 'Paga el impuesto de transferencia (3%)', 'Registra la propiedad a tu nombre'],
  },
];

const resources = [
  {
    icon: 'real_estate_agent',
    title: 'Asesores Inmobiliarios',
    description: 'Conecta con nuestros expertos para encontrar tu propiedad ideal.',
    link: '/contacto',
    buttonText: 'Contactar ahora',
  },
  {
    icon: 'calculate',
    title: 'Calculadora de Hipoteca',
    description: 'Estima tu cuota mensual y encuentra el mejor plan de financiamiento.',
    link: '#',
    buttonText: 'Calcular',
  },
  {
    icon: 'menu_book',
    title: 'Documentos Necesarios',
    description: 'Descarga la lista completa de documentos para el proceso de compra.',
    link: '#',
    buttonText: 'Descargar',
  },
];

const BuyingGuidePage = () => {
  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-600 px-4 py-16 sm:py-20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500 opacity-30" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-700 opacity-30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge bg-white/20 text-white border border-white/20 mb-4">
            📋 Guía paso a paso
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            Guía de Compra de Propiedad
          </h1>
          <p className="mt-3 text-brand-100">
            Todo lo que necesitas saber para comprar tu propiedad en República Dominicana, explicado de forma clara y sencilla.
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
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Consejos clave:</p>
                  <ul className="mt-2 space-y-1.5">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-brand-500 text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <h2 className="section-title text-center">Recursos y Herramientas</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {resources.map((res) => (
            <div key={res.title} className="card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <span className="material-symbols-outlined text-2xl">{res.icon}</span>
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                {res.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {res.description}
              </p>
              <Link to={res.link} className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                {res.buttonText} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BuyingGuidePage;
