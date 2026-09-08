import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { searchFlights } from '@/lib/amadeus';
import { sendPriceDropEmail } from '@/lib/email';

// Considera "queda de preço relevante" a partir desse percentual.
const DROP_THRESHOLD_PERCENT = 10;

export async function GET(request) {
  // Protege o endpoint: só aceita chamadas que enviem o segredo combinado.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();

  const { data: subscriptions, error } = await supabase
    .from('monitored_searches')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Erro ao buscar monitoramentos ativos:', error);
    return NextResponse.json({ error: 'Falha ao ler monitoramentos.' }, { status: 500 });
  }

  const results = [];

  for (const sub of subscriptions) {
    try {
      const offers = await searchFlights({
        origin: sub.origin,
        destination: sub.destination,
        departureDate: sub.departure_date,
        returnDate: sub.return_date,
        passengers: sub.passengers,
      });

      if (offers.length === 0) {
        results.push({ id: sub.id, status: 'sem-ofertas' });
        continue;
      }

      const cheapest = offers.reduce((min, o) =>
        o.pricePerPassenger < min.pricePerPassenger ? o : min
      );

      // Sempre registra o preço encontrado no histórico, mesmo sem queda.
      await supabase.from('price_history').insert({
        search_id: sub.id,
        price: cheapest.pricePerPassenger,
      });

      const previousPrice = sub.last_price;
      const dropped =
        previousPrice &&
        cheapest.pricePerPassenger <= previousPrice * (1 - DROP_THRESHOLD_PERCENT / 100);

      if (dropped) {
        await sendPriceDropEmail({
          to: sub.email,
          origin: sub.origin,
          destination: sub.destination,
          oldPrice: previousPrice,
          newPrice: cheapest.pricePerPassenger,
          link: cheapest.link,
        });
      }

      // Atualiza sempre o "último preço conhecido" para a próxima comparação.
      await supabase
        .from('monitored_searches')
        .update({ last_price: cheapest.pricePerPassenger, last_checked_at: new Date().toISOString() })
        .eq('id', sub.id);

      results.push({ id: sub.id, status: dropped ? 'queda-detectada' : 'sem-queda' });
    } catch (err) {
      console.error(`Erro ao checar monitoramento ${sub.id}:`, err);
      results.push({ id: sub.id, status: 'erro' });
    }
  }

  return NextResponse.json({ checked: results.length, results });
}
