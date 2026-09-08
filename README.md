# Radar de Passagens

App para buscar promoções de passagens aéreas em várias companhias e
monitorar a rota em segundo plano, avisando por e-mail quando o preço cai —
mesmo com o navegador fechado.

## Como funciona

- **Busca imediata**: você escolhe origem, destino, datas e número de
  passageiros, e o app consulta a API da Travelpayouts/Aviasales, que agrega
  preços de várias companhias.
- **Monitoramento contínuo**: ao clicar em "Monitorar essa rota", a busca é
  salva no banco (Supabase). Um job agendado (cron) revisita essa busca
  periodicamente, compara o preço com o último conhecido e, se cair o
  suficiente, envia um e-mail de alerta (via Resend).
- **Encerrar**: na página "Meus monitoramentos" você encerra a busca quando
  quiser, o que para as checagens.

## 1. Pré-requisitos (contas gratuitas)

1. [Node.js](https://nodejs.org/) 18+ instalado, e o [VS Code](https://code.visualstudio.com/).
2. Conta no [GitHub](https://github.com/).
3. Conta no [Vercel](https://vercel.com/) (dá para logar direto com o GitHub).
4. Conta no [Supabase](https://supabase.com/) — banco de dados gratuito.
5. Conta no [Travelpayouts](https://www.travelpayouts.com/) — dados de voos.
6. Conta no [Resend](https://resend.com/) — envio de e-mails.

## 2. Configurar o Supabase (banco de dados)

1. Crie um novo projeto no Supabase.
2. Vá em **SQL Editor** → **New query**, cole o conteúdo de
   `supabase/schema.sql` e clique em **Run**. Isso cria as tabelas
   `monitored_searches` e `price_history`.
3. Vá em **Project Settings → API** e copie:
   - `Project URL` → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → vai virar `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo)

## 3. Configurar a Amadeus for Developers (dados de voos)

1. Crie uma conta gratuita em [developers.amadeus.com/register](https://developers.amadeus.com/register)
   — o cadastro é imediato, sem etapa de aprovação.
2. Depois de logado, vá em **My Self-Service Workspace → Create new app**, dê
   um nome qualquer (ex: `radar-passagens`).
3. Copie a **API Key** e o **API Secret** gerados.

> Nota: o ambiente gratuito (`test`) usa uma base de dados de voos simulada,
> não é o mesmo inventário 100% ao vivo da produção — mas funciona bem para
> testar e rodar um monitoramento pessoal.

## 4. Configurar o Resend (e-mails)

1. Crie uma conta gratuita.
2. Verifique um domínio (ou use o domínio de testes deles para começar) e
   gere uma **API Key**.

## 5. Rodar localmente no VS Code

```bash
git clone <o-link-do-seu-repositorio-no-github>
cd passagens-app
npm install
cp .env.example .env.local
```

Abra `.env.local` e preencha todas as variáveis com os valores que você
copiou nos passos acima (inclusive `CRON_SECRET`, que pode ser qualquer
senha aleatória que você escolher).

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## 6. Subir para o GitHub

```bash
git init
git add .
git commit -m "Primeira versão do Radar de Passagens"
git branch -M main
git remote add origin <o-link-do-seu-repositorio-no-github>
git push -u origin main
```

## 7. Deploy na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe o repositório do GitHub.
2. Em **Environment Variables**, adicione todas as variáveis do seu
   `.env.local` (a Vercel nunca lê o `.env.local` do seu computador —
   precisa cadastrar lá).
3. Clique em **Deploy**. A cada `git push`, a Vercel republica sozinha.

## 8. Ativar as checagens periódicas

- **Opção simples (grátis, 1x por dia)**: o arquivo `vercel.json` já
  configura um Vercel Cron diário — não precisa fazer nada além do deploy.
- **Opção mais frequente (a cada 30 min, grátis via GitHub)**: edite
  `.github/workflows/check-prices.yml` e troque `SEU-PROJETO.vercel.app`
  pela URL real do seu app. Depois, no GitHub, vá em
  **Settings → Secrets and variables → Actions** e crie um secret chamado
  `CRON_SECRET` com o mesmo valor que você usou na Vercel. O GitHub Actions
  vai chamar seu endpoint de checagem automaticamente a cada 30 minutos.

## Estrutura de pastas

```
passagens-app/
├── app/
│   ├── page.js                    # tela principal (busca + monitorar)
│   ├── dashboard/page.js          # tela "meus monitoramentos"
│   ├── layout.js / globals.css
│   └── api/
│       ├── search/route.js        # busca imediata de passagens
│       ├── subscriptions/route.js # criar / listar / encerrar monitoramentos
│       └── cron/check-prices/route.js  # checagem periódica + envio de e-mail
├── components/
│   ├── AirportSelect.js
│   └── FlightResultCard.js
├── lib/
│   ├── airports.js       # lista de aeroportos do seletor
│   ├── amadeus.js        # integração com a API de voos
│   ├── email.js          # envio de e-mail via Resend
│   └── supabaseClient.js # conexão com o banco
├── supabase/schema.sql   # script de criação das tabelas
├── vercel.json           # configuração do cron diário
└── .github/workflows/check-prices.yml  # cron alternativo a cada 30 min
```

## Próximos passos possíveis

- Complementar a Amadeus com a Travelpayouts/Aviasales para mais cobertura de promoções.
- Adicionar autenticação de verdade (hoje o "login" é só o e-mail digitado).
- Adicionar um gráfico de histórico de preços na tela de monitoramentos.
