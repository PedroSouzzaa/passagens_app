import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabaseClient';
import { searchFlights } from '@/lib/amadeus';

// Cria um novo monitoramento: salva a busca no banco e já guarda o preço
// inicial, para servir de referência de comparação no cron job.
export async function POST(request) {
  const supabase = getSupabaseServiceClient();
  const body = await request.json();
  const { origin, destination, departureDate, returnDate, passengers, email } = body;

  if (!origin || !destination || !departureDate || !email) {
    return NextResponse.json(
      { error: 'Origem, destino, data de ida e e-mail são obrigatórios.' },
      { status: 400 }
    );
  }

  let initialPrice = null;
  try {
    const offers = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers,
    });
    if (offers.length > 0) {
      initialPrice = Math.min(...offers.map((o) => o.pricePerPassenger));
    }
  } catch (err) {
    console.error('Falha ao obter preço inicial:', err);
  }

  const { data, error } = await supabase
    .from('monitored_searches')
    .insert({
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || null,
      passengers: Number(passengers) || 1,
      email,
      last_price: initialPrice,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar monitoramento:', error);
    return NextResponse.json({ error: 'Não foi possível salvar o monitoramento.' }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}

// Lista os monitoramentos ativos de um e-mail, junto com o histórico de preços.
export async function GET(request) {
  const supabase = getSupabaseServiceClient();
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Informe o e-mail para listar seus monitoramentos.' }, { status: 400 });
  }

  const { data: subscriptions, error } = await supabase
    .from('monitored_searches')
    .select('*, price_history(price, checked_at)')
    .eq('email', email)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar monitoramentos:', error);
    return NextResponse.json({ error: 'Não foi possível carregar seus monitoramentos.' }, { status: 500 });
  }

  return NextResponse.json({ subscriptions });
}

// Encerra um monitoramento (o usuário clicou em "Encerrar busca").
export async function DELETE(request) {
  const supabase = getSupabaseServiceClient();
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Informe o id do monitoramento a encerrar.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('monitored_searches')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao encerrar monitoramento:', error);
    return NextResponse.json({ error: 'Não foi possível encerrar o monitoramento.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
