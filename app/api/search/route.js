import { NextResponse } from 'next/server';
import { searchFlights, markDeals } from '@/lib/amadeus';

export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, departureDate, returnDate, passengers } = body;

    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Origem, destino e data de ida são obrigatórios.' },
        { status: 400 }
      );
    }

    const offers = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: Number(passengers) || 1,
    });

    const withDeals = markDeals(offers).sort(
      (a, b) => a.pricePerPassenger - b.pricePerPassenger
    );

    return NextResponse.json({ offers: withDeals });
  } catch (error) {
    console.error('Erro em /api/search:', error);
    return NextResponse.json(
      { error: 'Não foi possível buscar as passagens agora. Tente novamente.' },
      { status: 500 }
    );
  }
}
