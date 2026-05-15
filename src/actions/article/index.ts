import { z } from "astro/zod";
import { db } from "@/db";
import { article as articleSchema } from "@/db/schema";
import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { defineAction, ActionError } from "astro:actions";
import { articleSchemaZod } from "@/interface/article";

export const article = {
  getArticles: defineAction({
    input: z.object({
      keyword: z.string().optional(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
    }),
    handler: async ({ keyword, page = 1, pageSize = 10 }) => {
      const offset = (page - 1) * pageSize;
      const where = keyword ? like(articleSchema.name, `%${keyword}%`) : undefined;

      const articles = await db.query.article.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: asc(articleSchema.name),
      });

      const totalResult = await db
        .select({ value: count() })
        .from(articleSchema)
        .where(where);
      const total = totalResult[0]?.value ?? 0;

      return { articles, total, page, pageSize };
    },
  }),

  upsert: defineAction({
    input: articleSchemaZod,
    handler: async ({ name, quantity }) => {
      let success = false;

      const existingArticle = await db.query.article.findFirst({
        where: eq(articleSchema.name, name),
      });

      if (existingArticle) {
        const { success: updateSuccess } = await db
          .update(articleSchema)
          .set({ quantity })
          .where(eq(articleSchema.id, existingArticle.id));
        success = updateSuccess;
      } else {
        const { success: insertSuccess } = await db
          .insert(articleSchema)
          .values({ name, quantity });
        success = insertSuccess;
      }

      if (!success) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: existingArticle
            ? "Error al actualizar el artículo"
            : "Error al crear el artículo",
        });
      }

      return { success: true, article: existingArticle };
    },
  }),

  remove: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async ({ id }) => {
      const { success } = await db
        .delete(articleSchema)
        .where(eq(articleSchema.id, id));

      if (!success) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al eliminar el artículo",
        });
      }

      return { success: true };
    },
  }),
};
