# Décisions techniques

Ce fichier documente les décisions d'architecture non triviales, les compromis acceptés et les pistes d'évolution.

---

## Rate limiting — In-memory vs Redis

**Décision :** Rate limiting in-memory par IP (sliding window 60 s).

**Limites par route :**
| Route | Limite | Raison |
|---|---|---|
| `POST /api/simulate` | 20 req/min/IP (configurable via `RATE_LIMIT_SIMULATE`) | Protège le quota CoinGecko (30 req/min plan Demo) |
| `POST /api/share` | 10 req/min/IP (configurable via `RATE_LIMIT_SHARE`) | Protège Supabase des insertions massives |

**Pourquoi in-memory et pas Redis ?**

L'implémentation actuelle stocke les timestamps dans un `Map` Node.js local à chaque instance Lambda Vercel. C'est suffisant car :
- La charge cible est **FAIBLE** (NFR-001 : < 100 utilisateurs simultanés, projet de démo)
- À faible trafic, Vercel maintient généralement **une seule instance** active
- Zéro dépendance externe, zéro coût, déploiement immédiat

**Limitation connue — multi-instance :**

Sur un trafic élevé, Vercel lance plusieurs instances Lambda en parallèle. Chaque instance a son propre `Map` — elles ne se parlent pas. Un utilisateur qui tombe alternativement sur des instances différentes peut théoriquement dépasser la limite.

```
Instance A [Map: IP=12.34.56.78 → 10 req]
Instance B [Map: IP=12.34.56.78 → 10 req]  ← même IP, compteurs indépendants
```

**Migration vers Redis (si la charge augmente) :**

Remplacer `src/lib/ratelimit.ts` par [Upstash Redis](https://upstash.com) + `@upstash/ratelimit` :

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '60 s'),
})
```

Nouvelles variables d'environnement requises : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## Formatage numérique — `groupDigits` vs `Intl.NumberFormat`

**Décision :** Deux formateurs coexistent intentionnellement.

- `src/lib/format.ts` → `groupDigits()` avec espace insécable (U+00A0) comme séparateur de milliers
- `CalendrierTab.tsx` → `Intl.NumberFormat('fr-FR')` nativement

**Pourquoi `groupDigits` ?**

`ResultsGrid` est un Server Component (pas de `'use client'`). Il peut s'exécuter dans Node.js où les données ICU ne sont pas toujours complètes (notamment sur WSL en développement local). `Intl.NumberFormat('fr-FR')` peut alors utiliser un espace simple ou une virgule selon les données ICU disponibles.

`groupDigits` garantit le séparateur indépendamment de l'environnement.

**Pourquoi `Intl.NumberFormat` dans `CalendrierTab` ?**

`CalendrierTab` est un Client Component (`'use client'`). Il s'exécute dans le navigateur, où ICU est toujours complet. `Intl.NumberFormat` y est correct et plus lisible pour le tableau.

**Si l'incohérence devient un problème :** migrer `CalendrierTab` vers `groupDigits` depuis `src/lib/format.ts`.

---

## CSP — `'unsafe-inline'` et `'unsafe-eval'`

**Décision :** La Content Security Policy autorise `'unsafe-inline'` et `'unsafe-eval'` sur les scripts et styles.

**Pourquoi ?** Next.js (App Router + Turbopack) injecte des scripts inline et utilise `eval()` pour le hot-reload et le chunking. Sans ces directives, l'application ne démarre pas.

**Mitigation :** L'application ne rend aucun HTML fourni par l'utilisateur. Le seul vecteur XSS serait une injection dans les données CoinGecko (externe) — atténué par la validation de la réponse (`isCoinGeckoResponse()`).

**Solution propre (si nécessaire) :** Générer un `nonce` par requête via middleware Next.js et l'injecter dans la CSP. Cela permet de supprimer `'unsafe-inline'` tout en autorisant les scripts légitimes de Next.js.
