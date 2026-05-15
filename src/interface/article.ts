import { z } from "astro/zod";

export const articleSchemaZod = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
});

export type ArticleSchema = z.infer<typeof articleSchemaZod>;
