# Simulateur d'investissement crypto

Simulateur historique d'investissements en cryptomonnaies (DCA ou ponctuel) basé sur les données CoinGecko.

## Stack

- **Next.js 16** (App Router, `"use cache"`, Server Components)
- **TypeScript** strict
- **Recharts** (graphiques interactifs)
- **Zod** (validation)
- **Supabase** (partage de simulation)

## Prérequis

- Node.js 20.9+
- pnpm (ou npm)
- Compte Supabase (optionnel — uniquement pour le partage)

## Installation

```bash
pnpm install
```

## Configuration

Copier `.env.example` en `.env.local` et renseigner :

```bash
cp .env.example .env.local
```

| Variable | Requis | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui (pour le partage) | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui (pour le partage) | Clé anonyme Supabase |
| `COINGECKO_API_KEY` | Oui | Clé API CoinGecko (nécessaire pour les données historiques) |
| `NEXT_PUBLIC_APP_URL` | Non | URL publique de l'app (ex: https://simu.monsite.fr) |

## Développement

```bash
pnpm dev
```

L'application est disponible sur http://localhost:3000.

## Build production

```bash
pnpm build
pnpm start
```

## Déploiement Vercel

1. Importer le repository depuis le dashboard Vercel
2. Renseigner les variables d'environnement dans **Settings → Environment Variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL du projet Vercel, ex: `https://simu-crypto.vercel.app`)
   - `COINGECKO_API_KEY`
3. Déployer — Vercel détecte automatiquement Next.js, aucune configuration supplémentaire n'est requise.

## Supabase — configuration

Dans votre projet Supabase existant, ouvrir l'**éditeur SQL** et exécuter :

```sql
create table shared_simulations (
  id uuid default gen_random_uuid() primary key,
  params jsonb not null,
  created_at timestamptz default now()
);

alter table shared_simulations enable row level security;

create policy "anon insert" on shared_simulations
  for insert to anon with check (true);

create policy "anon select" on shared_simulations
  for select to anon using (true);
```

Récupérer ensuite les clés dans **Settings → API** :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable (anciennement "anon public")** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Intégration iframe

Le simulateur est intégrable via iframe sur n'importe quelle page :

```html
<script src="https://cdn.jsdelivr.net/npm/iframe-resizer@4.3.9/js/iframeResizer.min.js"></script>

<iframe id="simu" src="https://votre-domaine.fr/embed?theme=dark" scrolling="no"></iframe>

<script>iFrameResize({ checkOrigin: false }, '#simu')</script>
```

Paramètres disponibles :
- `?theme=dark` (défaut) ou `?theme=light`

Pages de démonstration :
- `/embed-demo.html` — thème sombre
- `/embed-demo-light.html` — thème clair

## Fonctionnalités

- **DCA** : investissement périodique (quotidien, hebdomadaire, mensuel)
- **Ponctuel** : investissement unique
- **20 cryptomonnaies** supportées via CoinGecko
- **Graphiques** : Répartition (area-between) et Historique (double axe Y)
- **Zoom** : slider interactif + historique de zooms + bouton dézoomer
- **Partage** : lien permanent via Supabase, recalcul à la consultation
- **Export CSV** : calendrier détaillé des investissements
- **Export image** : capture PNG des résultats

## Avertissement

Ce simulateur utilise des données historiques uniquement. Les performances passées ne préjugent pas des performances futures. Ce n'est pas un conseil en investissement.
