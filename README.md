# Storefront (werktitel)

Webshop voor digitale game keys. Zie [PLAN.md](./PLAN.md) voor het volledige
bouwplan en [CLAUDE.md](./CLAUDE.md) voor de standing rules die elke sessie
volgt.

## Status

Fase 1 (plumbing, bewust ongestyled) — scaffold staat, nog **geen database
gekoppeld**. Dat is de eerstvolgende stap: een Supabase-account aanmaken en
de connection string in `.env.local` zetten.

Zonder database:
- Home, shop en productpagina's werken volledig (ze gebruiken tijdelijke
  voorbeelddata uit `src/lib/products.ts`, zie het commentaar daarin).
- Winkelmandje werkt (client-side, in `localStorage`).
- Afrekenen toont een "bestellingen zijn gepauzeerd"-melding — dat is de
  kill switch (`src/lib/kill-switch.ts`), die faalt bewust "closed" als hij
  geen databaseverbinding krijgt. Geen crash, wel een eerlijke melding.

Zodra `DATABASE_URL` is ingesteld en de eerste migratie is gedraaid, werkt de
volledige flow: home → product → winkelmandje → afrekenen → mock-betaling →
bevestiging met een fake key.

## Vereisten

- Node.js 22.12 of nieuwer (`node -v`)
- npm

## Aan de slag

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Database opzetten (volgende stap)

1. Maak een gratis project op [supabase.com](https://supabase.com).
2. Kopieer de Postgres connection string (Project Settings → Database →
   Connection string → URI).
3. Kopieer `.env.example` naar `.env.local` en vul `DATABASE_URL` in.
4. Draai de eerste migratie:

   ```bash
   npm run prisma:migrate
   ```

5. Zet de kill switch aan zodat afrekenen werkt — er is nog geen
   adminpaneel (dat komt in Fase 3.5), dus dit gaat via Prisma Studio:

   ```bash
   npx prisma studio
   ```

   Open `ShopSettings`, maak (indien nodig) de rij met `id = 1` aan, en zet
   `checkoutEnabled` op `true`.

## Scripts

| Commando | Doet |
|---|---|
| `npm run dev` | Lokale ontwikkelserver |
| `npm run build` | Productiebuild |
| `npm run lint` | ESLint |
| `npm test` | Testsuite (Vitest), eenmalig |
| `npm run test:watch` | Testsuite, watch-modus |
| `npm run prisma:generate` | Prisma Client genereren uit het schema |
| `npm run prisma:migrate` | Migratie aanmaken en uitvoeren (dev) |

## Architectuur — de plumbing-laag

Elke externe dienst zit achter één interface met een mock-implementatie
(deze fase) en een stub voor de echte dienst (Fase 3):

- **Fulfillment** — `src/lib/fulfillment/`. `MockFulfillmentProvider`
  simuleert elk foutscenario op aanvraag via de vaste product-ID's in
  `MOCK_SCENARIO_PRODUCT_IDS` (out of stock, lege balans, timeout,
  image-key, awaiting_code).
- **Betalingen** — `src/lib/payments/mollie-stub.ts`, plus een
  mock-betaalpagina op `/checkout/mock-payment`.
- **E-mail** — `src/lib/email/`. `MockEmailProvider` verstuurt niets, logt
  alleen wát verstuurd zou zijn (nooit de key zelf).

Welke implementatie draait, wordt bepaald door env-variabelen
(`FULFILLMENT_PROVIDER`, `EMAIL_PROVIDER`) — de rest van de app weet niet
welke het is.

Andere kernstukken:

- `src/lib/order-state-machine.ts` — de enige plek die bepaalt welke
  statusovergangen van een bestelling toegestaan zijn.
- `src/lib/event-log.ts` — de enige plek die naar `EventLog` schrijft, en
  redacteert defensief alles wat op een sleutelwaarde lijkt.
- `src/lib/consent.ts` — cookietoestemming én de
  herroepingsrecht-waiver bij het afrekenen; beide met versienummer en
  timestamp.
- `src/lib/kill-switch.ts` — de noodknop uit Fase 1, een databasevlag die
  bewust "closed" faalt als de database niet bereikbaar is.

## Tests

```bash
npm test
```

Dekt op dit moment: de state machine (elke toegestane en verboden
overgang), elk mock-fulfilmentscenario, en de idempotentie van de
betaal-webhook (dezelfde notificatie twee keer mag nooit twee keer een key
leveren).
