'use client';

import { useState } from 'react';
import Link from 'next/link';
import AirportSelect from '@/components/AirportSelect';
import FlightResultCard from '@/components/FlightResultCard';

export default function HomePage() {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    email: '',
  });
  const [offers, setOffers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [feedback, setFeedback] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    setOffers(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || 'Não foi possível buscar as passagens.');
      } else if (data.offers.length === 0) {
        setFeedback('Nenhuma passagem encontrada para essa rota e datas.');
        setOffers([]);
      } else {
        setOffers(data.offers);
      }
    } catch (err) {
      setFeedback('Erro de conexão. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMonitor() {
    if (!form.email) {
      setFeedback('Informe seu e-mail para receber os alertas de promoção.');
      return;
    }
    setMonitoring(true);
    setFeedback('');

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || 'Não foi possível ativar o monitoramento.');
      } else {
        setFeedback('Monitoramento ativado! Você receberá um e-mail quando o preço cair.');
      }
    } catch (err) {
      setFeedback('Erro de conexão. Tente novamente em instantes.');
    } finally {
      setMonitoring(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-sky-950">Radar de Passagens</h1>
        <p className="text-mist mt-1">
          Busque promoções em várias companhias de uma vez e continue de olho no
          preço mesmo depois de fechar o navegador.{' '}
          <Link href="/dashboard" className="text-sky-800 underline underline-offset-2">
            Ver meus monitoramentos
          </Link>
        </p>
      </header>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-sky-600/10 p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <AirportSelect
            label="Origem"
            value={form.origin}
            onChange={(v) => updateField('origin', v)}
            excludeCode={form.destination}
          />
          <AirportSelect
            label="Destino"
            value={form.destination}
            onChange={(v) => updateField('destination', v)}
            excludeCode={form.origin}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-mist font-medium">
            Data de ida
            <input
              type="date"
              required
              value={form.departureDate}
              onChange={(e) => updateField('departureDate', e.target.value)}
              className="rounded-lg border border-sky-600/20 px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-mist font-medium">
            Data de volta (opcional)
            <input
              type="date"
              value={form.returnDate}
              onChange={(e) => updateField('returnDate', e.target.value)}
              className="rounded-lg border border-sky-600/20 px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-mist font-medium">
            Passageiros
            <input
              type="number"
              min={1}
              max={9}
              required
              value={form.passengers}
              onChange={(e) => updateField('passengers', e.target.value)}
              className="rounded-lg border border-sky-600/20 px-3 py-2.5"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm text-mist font-medium">
          E-mail para receber alertas de queda de preço
          <input
            type="email"
            placeholder="voce@exemplo.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="rounded-lg border border-sky-600/20 px-3 py-2.5"
          />
        </label>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-800 text-white font-semibold px-5 py-2.5 rounded-lg
              hover:bg-sky-950 transition-colors disabled:opacity-60"
          >
            {loading ? 'Buscando...' : 'Pesquisar'}
          </button>
          <button
            type="button"
            onClick={handleMonitor}
            disabled={monitoring}
            className="bg-deal text-white font-semibold px-5 py-2.5 rounded-lg
              hover:bg-deal-dark transition-colors disabled:opacity-60"
          >
            {monitoring ? 'Ativando...' : 'Monitorar essa rota'}
          </button>
        </div>

        {feedback && <p className="text-sm text-mist">{feedback}</p>}
      </form>

      {offers && offers.length > 0 && (
        <section className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-sky-950">
            {offers.length} ofertas encontradas, da mais barata para a mais cara
          </h2>
          {offers.map((offer, i) => (
            <FlightResultCard key={i} offer={offer} />
          ))}
        </section>
      )}
    </main>
  );
}
