// Integração com a Amadeus Self-Service API para buscar preços de passagens.
// Documentação: https://developers.amadeus.com/self-service/category/flights

const AMADEUS_BASE_URL = 'https://test.api.amadeus.com';

// A Amadeus usa OAuth2: primeiro pedimos um token de acesso, depois usamos
// esse token nas chamadas de busca. O token expira em ~30 min, mas para
// simplificar pedimos um novo a cada busca (o tráfego de um projeto pessoal
// é baixo o suficiente para isso não ser um problema).
async function getAccessToken() {
  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_API_KEY,
      client_secret: process.env.AMADEUS_API_SECRET,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao autenticar na Amadeus: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

function buildFallbackLink({ origin, destination, departureDate, returnDate }) {
  // A Amadeus (ambiente self-service) não devolve um link de compra direto,
  // então montamos um link de busca no Google Flights como alternativa.
  const query = returnDate
    ? `voos de ${origin} para ${destination} em ${departureDate} voltando ${returnDate}`
    : `voos de ${origin} para ${destination} em ${departureDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

/**
 * Busca as passagens mais baratas para uma rota e datas específicas.
 * @param {Object} params
 * @param {string} params.origin - código IATA de origem, ex: "GRU"
 * @param {string} params.destination - código IATA de destino, ex: "LIS"
 * @param {string} params.departureDate - "AAAA-MM-DD"
 * @param {string} params.returnDate - "AAAA-MM-DD" (opcional, ida e volta)
 * @param {number} params.passengers - número de passageiros (1 adulto por padrão)
 * @returns {Promise<Array>} lista de ofertas encontradas
 */
export async function searchFlights({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
}) {
  const token = await getAccessToken();

  const url = new URL(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers`);
  url.searchParams.set('originLocationCode', origin);
  url.searchParams.set('destinationLocationCode', destination);
  url.searchParams.set('departureDate', departureDate);
  if (returnDate) url.searchParams.set('returnDate', returnDate);
  url.searchParams.set('adults', String(passengers));
  url.searchParams.set('currencyCode', 'BRL');
  url.searchParams.set('max', '30');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar a Amadeus: ${response.status}`);
  }

  const json = await response.json();
  const offers = json.data || [];

  return offers.map((offer) => {
    const outbound = offer.itineraries[0];
    const inbound = offer.itineraries[1];
    const firstSegment = outbound.segments[0];
    const lastOutboundSegment = outbound.segments[outbound.segments.length - 1];
    const total = parseFloat(offer.price.total);

    return {
      origin: firstSegment.departure.iataCode,
      destination: lastOutboundSegment.arrival.iataCode,
      airline: offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode,
      flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
      departureAt: firstSegment.departure.at,
      returnAt: inbound ? inbound.segments[0].departure.at : null,
      transfers: outbound.segments.length - 1,
      pricePerPassenger: total / passengers,
      estimatedTotal: total,
      link: buildFallbackLink({ origin, destination, departureDate, returnDate }),
    };
  });
}

/**
 * Marca como "promoção" qualquer oferta com preço abaixo da média do lote
 * retornado — uma heurística simples e transparente para destacar bons preços.
 */
export function markDeals(offers, thresholdPercent = 15) {
  if (offers.length === 0) return offers;
  const avg = offers.reduce((sum, o) => sum + o.pricePerPassenger, 0) / offers.length;
  const cutoff = avg * (1 - thresholdPercent / 100);
  return offers.map((o) => ({
    ...o,
    isDeal: o.pricePerPassenger <= cutoff,
    averagePrice: Math.round(avg),
  }));
}
