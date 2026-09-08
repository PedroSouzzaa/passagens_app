function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function FlightResultCard({ offer }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3
        rounded-xl border p-4 bg-white
        ${offer.isDeal ? 'border-deal shadow-[0_0_0_1px_theme(colors.deal.DEFAULT)]' : 'border-sky-600/10'}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-ink">
            {offer.origin} → {offer.destination}
          </span>
          {offer.isDeal && (
            <span className="text-xs font-semibold text-deal-dark bg-deal-light px-2 py-0.5 rounded-full">
              Promoção
            </span>
          )}
          {offer.transfers === 0 && (
            <span className="text-xs font-medium text-mist bg-sky-100 px-2 py-0.5 rounded-full">
              Voo direto
            </span>
          )}
        </div>
        <p className="text-sm text-mist mt-1">
          Companhia {offer.airline} · voo {offer.flightNumber} · ida em{' '}
          {formatDate(offer.departureAt)}
          {offer.returnAt && <> · volta em {formatDate(offer.returnAt)}</>}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-2xl font-bold text-sky-800">
          {formatBRL(offer.estimatedTotal)}
        </p>
        <p className="text-xs text-mist">{formatBRL(offer.pricePerPassenger)} / pessoa</p>
        <a
          href={offer.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-1.5 text-sm font-medium text-sky-800 underline underline-offset-2"
        >
          Ver oferta
        </a>
      </div>
    </div>
  );
}
