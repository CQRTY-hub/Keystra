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
   adminpaneel (dat komt in Fase 3.5), dus dit gaat via het seed-script:

   ```bash
   npm run db:seed
   ```

   Dit maakt (idempotent, alleen als hij nog niet bestaat) de
   `ShopSettings`-rij aan met `checkoutEnabled: true`. Bestaat de rij al,
   dan laat het script hem met rust — een herhaalde run zet dus nooit per
   ongeluk verkoop weer aan nadat je hem bewust gepauzeerd hebt.

   Wil je de instelling handmatig bekijken of wijzigen: `npm run
   prisma:studio` opent Prisma Studio.

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
| `npm run prisma:studio` | Prisma Studio openen (database inzien/bewerken) |
| `npm run db:seed` | `ShopSettings`-rij aanmaken (kill switch aan), idempotent |

Alle `prisma:*`- en `db:*`-scripts laden `.env.local` expliciet (via
`dotenv-cli`) — de Prisma CLI leest die van zichzelf niet, alleen een
bestand genaamd `.env`.

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

## Bekend gat: awaiting_code-resolutie (Fase 3)

Als een bestelling in `awaiting_code` terechtkomt, staat de op te halen leverancierscode
(`codeId`) sinds kort op `OrderItem.pendingCodeId` — maar er bestaat nog **niets** dat die
ooit ophaalt. Fase 3 moet een resolutiejob bouwen die:

1. elke `OrderItem` met een `pendingCodeId` op een `awaiting_code`-order oppikt;
2. de code ophaalt via `GET /v3/codes/{codeId}` (`CodesWholesaleProvider.retrieveCode()`,
   nu nog een stub met TODO);
3. de key **eerst** wegschrijft naar `DeliveredKey`, net als bij een gewone bestelling —
   nooit tonen of mailen vóór die write klaar is (non-negotiable #1) — en pas dán de order
   naar `completed` zet;
4. **loggen wanneer een `pendingCodeId` te lang openstaat.** Een bestelling die daar dagen
   in blijft hangen is een betalende klant zonder key en zonder dat iemand het merkt, tenzij
   deze job daar expliciet op let en het meldt.

Volledige uitwerking staat als TODO onderaan `src/lib/fulfillment/codeswholesale-provider.ts`.

## Tests

```bash
npm test
```

Dekt op dit moment: de state machine (elke toegestane en verboden
overgang), elk mock-fulfilmentscenario, en de idempotentie van de
betaal-webhook (dezelfde notificatie twee keer mag nooit twee keer een key
leveren).
