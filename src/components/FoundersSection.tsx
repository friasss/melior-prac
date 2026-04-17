import { useState, useEffect } from 'react';
import { fetchFounders, type Founder } from '../services/api';

function FounderCard({ founder }: { founder: Founder }) {
  const initials = founder.name.split(' ').map(w => w[0]).filter((_, i) => i === 0 || i === 2).join('').toUpperCase();

  return (
    <div className="card p-8 flex flex-col items-center text-center gap-5 transition-transform duration-300 hover:-translate-y-1">
      {/* Photo */}
      <div className="relative">
        {founder.photo ? (
          <img
            src={founder.photo}
            alt={founder.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-brand-100 dark:ring-brand-900"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-bold text-white ring-4 ring-brand-100 dark:ring-brand-900">
            {initials}
          </div>
        )}
        {/* Accent dot */}
        <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400 dark:border-card-dark" />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{founder.name}</h3>
        <span className="mt-1 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          {founder.role}
        </span>
      </div>

      {/* Bio */}
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
        {founder.bio}
      </p>
    </div>
  );
}

export default function FoundersSection() {
  const [founders, setFounders] = useState<Founder[]>([]);

  useEffect(() => {
    fetchFounders().then(setFounders).catch(() => {});
  }, []);

  if (founders.length === 0) return null;

  return (
    <section className="bg-surface-light py-20 dark:bg-surface-dark">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-600 dark:bg-brand-900/40 dark:text-brand-300 mb-4">
            Quiénes somos
          </span>
          <h2 className="font-heading text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Los fundadores
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Dos personas con una misión: hacer que encontrar tu hogar ideal sea simple, transparente y accesible para todos.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {founders.map(f => <FounderCard key={f.id} founder={f} />)}
        </div>
      </div>
    </section>
  );
}
