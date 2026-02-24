const ContactPage = () => {
  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 sm:py-20">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            Contáctanos
          </h1>
          <p className="mt-3 text-slate-300">
            Estamos aquí para ayudarte a encontrar la propiedad perfecta. Escríbenos o llámanos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact form */}
          <div className="card p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
              Envíanos un mensaje
            </h2>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                  <input type="text" placeholder="Tu nombre" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                  <input type="text" placeholder="Tu apellido" className="input-field" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                <input type="email" placeholder="tuemail@ejemplo.com" className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                <input type="tel" placeholder="809-000-0000" className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">¿En qué te podemos ayudar?</label>
                <select className="input-field">
                  <option>Comprar una propiedad</option>
                  <option>Alquilar una propiedad</option>
                  <option>Vender mi propiedad</option>
                  <option>Inversión inmobiliaria</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos más sobre lo que buscas..."
                  className="input-field resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base">
                <span className="material-symbols-outlined text-lg">send</span>
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6 lg:col-span-2">
            {[
              { icon: 'location_on', title: 'Oficina Principal', lines: ['Av. Abraham Lincoln #1001', 'Torre Empresarial, Piso 12', 'Santo Domingo, DN'] },
              { icon: 'call', title: 'Teléfono', lines: ['+1 (809) 555-0100', '+1 (809) 555-0200'] },
              { icon: 'mail', title: 'Correo', lines: ['info@melior.com.do', 'ventas@melior.com.do'] },
              { icon: 'schedule', title: 'Horario', lines: ['Lun - Vie: 8:00 AM - 6:00 PM', 'Sáb: 9:00 AM - 1:00 PM'] },
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
