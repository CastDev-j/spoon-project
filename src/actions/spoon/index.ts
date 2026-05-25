import { z } from "astro/zod";
import { db } from "@/db";
import { article as articleSchema } from "@/db/schema";
import { sql, eq, gt } from "drizzle-orm";
import { defineAction, ActionError } from "astro:actions";

export const spoon = {
  generate: defineAction({
    input: z.object({
      spoons: z.number().min(1, "Debe ser al menos 1 cuchara"),
    }),
    handler: async ({ spoons }) => {
      const results = [];

      for (let i = 1; i <= spoons; i++) {
        const prizes = [];

        for (let j = 0; j < 10; j++) {
          const [article] = await db
            .select()
            .from(articleSchema)
            .where(gt(articleSchema.quantity, 0))
            .orderBy(sql`RANDOM()`)
            .limit(1);

          if (!article) {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: `No hay suficientes artículos para completar la cuchara #${i}`,
            });
          }

          await db
            .update(articleSchema)
            .set({ quantity: article.quantity - 1 })
            .where(eq(articleSchema.id, article.id));

          prizes.push(article);
        }

        results.push({
          spoon: i,
          prizes,
        });
      }

      return { results };
    },
  }),
};
