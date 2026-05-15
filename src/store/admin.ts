import { atom } from "nanostores";
import type { ArticleSchema } from "@/interface/article";

export const inputArticle = atom<ArticleSchema | undefined>();

export const currentArticlesPage = atom({
  page: 1,
  version: 0,
});
