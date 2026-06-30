# Carte du projet — Simulateur Crypto DCA

## Architecture en une phrase

Application Next.js 15 App Router (TypeScript) exposant un simulateur d'investissement crypto (ponctuel ou DCA) basé sur des prix historiques CoinGecko, avec partage anonyme via Supabase et intégration iframe.

---

## Modules principaux

| Module | Rôle | Fichiers clés |
|---|---|---|
| `src/app/api/simulate/` | Route POST — valide les params, appelle CoinGecko, exécute le calcul, retourne le résultat | `route.ts` |
| `src/app/api/share/` | Route POST — valide les params, insère dans Supabase, retourne l'id + URL | `route.ts` |
| `src/app/share/[id]/` | Page SSR — lit les params depuis Supabase, recalcule et affiche le résultat | `page.tsx` |
| `src/app/embed/` | Page sans chrome, avec iframe-resizer, thème via `?theme=` validé | `page.tsx` |
| `src/lib/dca.ts` | Moteur de calcul DCA/ponctuel — sans dépendance UI, pur TypeScript | — |
| `src/lib/coingecko.ts` | Appel API CoinGecko avec cache Next.js (`cacheLife('hours')`) et logging d'erreur structuré | — |
| `src/lib/validation.ts` | Schéma Zod `SimulationParamsSchema` — partagé entre les deux routes API | — |
| `src/lib/supabase.ts` | Client Supabase lazy (`insertSharedSimulation`, `getSharedSimulation`) | — |
| `src/lib/assets.ts` | Liste curatée de 20 actifs + `ASSET_MAP` pour validation whitelist | — |
| `src/lib/config.ts` | Config centralisée depuis `process.env` + helpers thème | — |
| `src/lib/logger.ts` | `logCoinGeckoError()` — log structuré JSON sur stderr (NFR-009) | — |
| `src/components/` | Composants React — `Simulateur` (orchestrateur), `SimulateurForm`, `ResultsGrid`, `ChartTabs`, `CalendrierTab`, `SharePanel` | — |
| `src/types/simulation.ts` | Types partagés : `SimulationParams`, `SimulationResult`, `SimulationEntry`, `DailyPoint`, `PricePoint`, `CuratedAsset` | — |
| `src/themes/` | Variables CSS par thème (`dark.css`, `light.css`) | — |
| `public/embed-demo.html` | Page de démo statique avec deux iframes (thème clair + sombre) | — |

---

## Entités et types clés

```
SimulationParams          — actif (CoinGecko id), montant, frequence, dateDebut, dateFin
  └── validé par          SimulationParamsSchema (Zod, validation identique API/formulaire)

SimulationResult          — capitalFinal, capitalInvesti, plusValue, performance,
                            entries[] (par versement → Calendrier/CSV),
                            dailySeries[] (quotidien → Graphiques),
                            warnings[], adjustedStart?

SimulationEntry           — une ligne du Calendrier : date, prixDuJour, montantInvesti,
                            quantiteAcquise, montantInvestiCumule, quantiteAcquiseCumulee,
                            valeurCumulee

DailyPoint                — une ligne des graphiques : date, prixDuJour, montantInvestiCumule,
                            quantiteAcquiseCumulee, valeurCumulee, gainsPertes

SharedSimulation (Supabase) — id (uuid), params (jsonb = SimulationParams), created_at
```

---

## Flux métier critiques

### Simulation (chemin principal)

1. Visiteur soumet le formulaire → `Simulateur.handleSubmit()`
2. `POST /api/simulate` reçoit le body JSON
3. `SimulationParamsSchema.safeParse()` valide (actif whitelist, montant > 0, dates passées, dateDebut ≤ dateFin)
4. `fetchHistoricalPrices()` appelle CoinGecko `/coins/{id}/market_chart/range` (résultat mis en cache 1h)
5. `normalizeToDailyPrices()` déduplicte les points par jour
6. `runSimulation()` calcule `entries[]` + `dailySeries[]` + totaux
7. Retourne `{ result: SimulationResult }` → UI met à jour `ResultsGrid` + `ChartTabs` + `CalendrierTab`

### Partage

1. Clic « Partager » → `POST /api/share` (params validés à nouveau)
2. `insertSharedSimulation()` insère dans Supabase `shared_simulations`
3. Retourne `{ id, url }` → `SharePanel` affiche le lien
4. Visiteur ouvre `/share/[id]` → SSR lit les params, recalcule via `runSimulation()`, affiche

---

## Patterns à respecter

- **Validation** : toujours passer par `SimulationParamsSchema.safeParse()` sur les routes API — jamais de confiance aux données entrantes
- **Whitelist actifs** : `ASSET_MAP.has(id)` dans le schéma Zod — jamais passer un id arbitraire à CoinGecko
- **Whitelist thèmes** : `isValidTheme()` dans `/embed` — jamais charger une CSS arbitraire depuis le paramètre URL
- **Calcul** : `runSimulation()` prend des `PricePoint[]` déjà normalisés — jamais de fetch dans `dca.ts`
- **Logging erreurs CoinGecko** : toujours via `logCoinGeckoError()` (log sur stderr, JSON structuré, pas de données sensibles)
- **Supabase** : client lazy — le module est importé sans crasher si les env vars sont absentes au build
- **Headers iframe** : `X-Frame-Options: DENY` sur toutes les routes sauf `/embed` (configuré dans `next.config.ts`)
- **Thème** : exclusivement via variables CSS `--bg`, `--surface`, `--text`, `--accent-primary`, `--accent-secondary`, `--border`, `--color-gain`, `--color-loss`

---

## Variables d'environnement

| Variable | Requis | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Oui (partage) | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Oui (partage) | Clé anonyme Supabase (RLS en place) |
| `NEXT_PUBLIC_APP_URL` | Non | URL de base pour les liens de partage (défaut : `http://localhost:3000`) |
| `COINGECKO_API_KEY` | Non | Clé CoinGecko optionnelle (plan Demo gratuit si absente) |

---

## Sécurité — points clés

- Pas d'authentification (visiteur anonyme uniquement, by design)
- RLS Supabase : `insert` + `select` anonymes uniquement sur `shared_simulations` (pas d'`update`/`delete`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` est publique par design (anon key Supabase + RLS = correct)
- Pas de secret dans le code — toutes les clés via `process.env`
- Pas de `X-Frame-Options` sur `/embed` (intentionnel FR-033) ; `DENY` partout ailleurs
- Validation à double niveau : formulaire client (retour immédiat) + API (défense en profondeur)

---

## Cas d'erreur notables

| Cas | Comportement |
|---|---|
| CoinGecko indisponible | HTTP 502, message UI, log structuré stderr, pas de retry |
| Actif sans données sur la période | `SimulationError('NO_DATA')` → HTTP 422 |
| `dateDebut` avant première cotation | Ajustement silencieux + warning UI (FR-050) |
| `dateFin` avant première cotation | Rejet complet (FR-051) |
| Supabase insert échoué | HTTP 502, message UI (EC-006) |
| `/share/[id]` id inconnu | Page « Simulation introuvable » (EC-004) |
| `?theme=` invalide sur `/embed` | Fallback silencieux sur `dark` (EC-005) |
