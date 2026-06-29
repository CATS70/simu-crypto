import { z } from 'zod'
import { ASSET_MAP } from './assets'

const today = () => new Date().toISOString().split('T')[0] as string

export const SimulationParamsSchema = z
  .object({
    actif: z
      .string()
      .refine((id) => ASSET_MAP.has(id), { message: "L'actif sélectionné n'est pas dans la liste autorisée." }), // FR-041
    montant: z
      .number({ invalid_type_error: 'Le montant doit être un nombre.' })
      .finite()
      .positive({ message: 'Le montant doit être strictement positif.' }), // FR-043
    frequence: z.enum(['quotidienne', 'hebdomadaire', 'mensuelle'], {
      errorMap: () => ({
        message: "La fréquence doit être 'quotidienne', 'hebdomadaire' ou 'mensuelle'.",
      }),
    }),
    dateDebut: z.string().date('La date de début doit être au format YYYY-MM-DD.'), // FR-046
    dateFin: z.string().date('La date de fin doit être au format YYYY-MM-DD.'),    // FR-046
  })
  .superRefine((data, ctx) => {
    const todayStr = today()

    // FR-047 — dates passées uniquement
    if (data.dateDebut > todayStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de début ne peut pas être dans le futur.',
        path: ['dateDebut'],
      })
    }

    // Limite plan Demo CoinGecko : 365 jours d'historique maximum
    const minDate = new Date()
    minDate.setDate(minDate.getDate() - 365)
    const minDateStr = minDate.toISOString().split('T')[0] as string
    if (data.dateDebut < minDateStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La date de début ne peut pas dépasser 365 jours dans le passé (plan Demo CoinGecko). Date minimale : ${minDateStr}.`,
        path: ['dateDebut'],
      })
    }
    if (data.dateFin > todayStr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de fin ne peut pas être dans le futur.',
        path: ['dateFin'],
      })
    }

    // FR-048 — dateDebut <= dateFin
    if (data.dateDebut > data.dateFin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de début doit être antérieure ou égale à la date de fin.',
        path: ['dateDebut'],
      })
    }
  })

export type ValidatedSimulationParams = z.infer<typeof SimulationParamsSchema>
