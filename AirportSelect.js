import { AIRPORTS } from '@/lib/airports';

export default function AirportSelect({ label, value, onChange, excludeCode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-mist font-medium">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-sky-600/20 bg-white px-3 py-2.5 text-ink
          text-base focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
      >
        <option value="">Selecione um aeroporto</option>
        {AIRPORTS.filter((a) => a.code !== excludeCode).map((airport) => (
          <option key={airport.code} value={airport.code}>
            {airport.city} ({airport.code}) — {airport.name}
          </option>
        ))}
      </select>
    </label>
  );
}
