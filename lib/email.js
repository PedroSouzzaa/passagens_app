import { Resend } from 'resend';

/**
 * Envia um e-mail avisando o usuário que o preço de uma rota monitorada caiu.
 * O cliente Resend é criado aqui dentro (e não no topo do arquivo) para que
 * a variável de ambiente só seja lida quando a função realmente roda, e não
 * durante a etapa de build/coleta de dados de página do Next.js.
 */
export async function sendPriceDropEmail({
  to,
  origin,
  destination,
  oldPrice,
  newPrice,
  link,
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const quedaPercentual = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  await resend.emails.send({
    from: process.env.NOTIFY_EMAIL_FROM,
    to,
    subject: `Preço caiu ${quedaPercentual}%: ${origin} → ${destination}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1B3A5C;">Encontramos uma queda de preço! ✈️</h2>
        <p><strong>${origin} → ${destination}</strong></p>
        <p>Preço anterior: R$ ${oldPrice.toFixed(2)}</p>
        <p style="font-size: 1.4em; color:#E8834B;">
          <strong>Novo preço: R$ ${newPrice.toFixed(2)} (-${quedaPercentual}%)</strong>
        </p>
        <p><a href="${link}" style="background:#1B3A5C;color:#fff;padding:10px 16px;
          border-radius:6px;text-decoration:none;">Ver passagem</a></p>
        <p style="color:#5C6B7A;font-size:0.85em;">
          Você está recebendo este e-mail porque pediu para monitorar essa rota
          no seu buscador de passagens.
        </p>
      </div>
    `,
  });
}
