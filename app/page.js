'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatBRL(value) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DashboardPage() {
  const [email, setEmail] = useState('');
  const [subscriptions, setSubscriptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function loadSubscriptions(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch(`/api/subscriptions?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Não foi possível carregar seus monitoramentos.');
      } else {
        setSubscriptions(data.subscriptions);
      }
    } catch (err) {
      setFeedback('Erro de conexão. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  async function stopMonitoring(id) {
    const res = await fetch(`/api/subscriptions?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-sky-950">Meus monitoramentos</h1>
        <p className="text-mist mt-1">
          <Link href="/" className="text-sky-800 underline underline-offset-2">
            ← Voltar para a busca
          </Link>
        </p>
      </header>

      <form onSubmit={loadSubscriptions} className="flex gap-3 mb-8">
        <input
          type="email"
          required
          placeholder="Digite o e-mail usado para monitorar"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-lg border border-sky-600/20 px-3 py-2.5"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-800 text-white font-semibold px-5 py-2.5 rounded-lg
            hover:bg-sky-950 transition-colors disabled:opacity-60"
        >
          {loading ? 'Carregando...' : 'Ver monitoramentos'}
        </button>
      </form>

      {feedback && <p className="text-sm text-mist mb-4">{feedback}</p>}

      {subscriptions && subscriptions.length === 0 && (
        <p className="text-mist">Nenhum monitoramento ativo para esse e-mail ainda.</p>
      )}

      <div className="space-y-3">
        {subscriptions?.map((sub) => (
          <div key={sub.id} className="bg-white rounded-xl border border-sky-600/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">
                  {sub.origin} → {sub.destination}
                </p>
                <p className="text-sm text-mist">
                  Ida: {sub.departure_date}
                  {sub.return_date && <> · Volta: {sub.return_date}</>} ·{' '}
                  {sub.passengers} passageiro(s)
                </p>
                <p className="text-sm text-mist mt-1">
                  Último preço encontrado:{' '}
                  <span className="font-semibold text-sky-800">
                    {formatBRL(sub.last_price)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => stopMonitoring(sub.id)}
                className="text-sm font-medium text-deal-dark border border-deal
                  rounded-lg px-3 py-1.5 hover:bg-deal-light transition-colors shrink-0"
              >
                Encerrar busca
              </button>
            </div>

            {sub.price_history?.length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-sky-800 cursor-pointer">
                  Ver histórico de preços ({sub.price_history.length} checagens)
                </summary>
                <ul className="mt-2 text-sm text-mist space-y-1">
                  {sub.price_history
                    .sort((a, b) => new Date(b.checked_at) - new Date(a.checked_at))
                    .map((h, i) => (
                      <li key={i}>
                        {new Date(h.checked_at).toLocaleString('pt-BR')} — {formatBRL(h.price)}
                      </li>
                    ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
