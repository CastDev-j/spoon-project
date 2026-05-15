import { actions } from "astro:actions";
import { useState, useEffect, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Popup } from "../ui/Popup";
import { Button } from "../ui/Button";
import { currentArticlesPage, inputArticle } from "@/store/admin";
import { useStore } from "better-auth/react";
import { Skeleton } from "../ui/Skeleton";
import { cn } from "@/lib/cn";

interface Article {
  id: string;
  name: string;
  quantity: number;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
}

const TableSkeleton = () => (
  <div className="flex-1 overflow-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-jeton-red/10">
          <th className="px-5 py-3.5 text-left font-medium text-red-velvet/60 text-xs uppercase tracking-[0.03em]">
            Nombre
          </th>
          <th className="px-5 py-3.5 text-left font-medium text-red-velvet/60 text-xs uppercase tracking-[0.03em]">
            Cantidad
          </th>
          <th className="px-5 py-3.5 text-right" />
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((i) => (
          <tr key={i} className="border-b border-jeton-red/5 last:border-none">
            <td className="px-5 py-2.5">
              <Skeleton className="h-7 w-44" />
            </td>
            <td className="px-5 py-2.5">
              <Skeleton className="h-7 w-10" />
            </td>
            <td className="px-5 py-2.5">
              <div className="flex justify-end">
                <Skeleton className="h-6 w-6 rounded-md p-4" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TableEmpty = () => (
  <div className="flex-1 flex items-center justify-center text-red-velvet/40 text-sm">
    No hay artículos registrados
  </div>
);

const TableHeader = ({ total }: { total: number }) => (
  <div className="px-5 py-4 border-b border-jeton-red/10 flex items-center justify-between">
    <h2 className="text-sm font-medium tracking-[0.01em] text-text-black">
      Artículos registrados
    </h2>
    <span className="text-xs text-red-velvet/50">{total} en total</span>
  </div>
);

interface TableRowProps {
  article: Article;
  onRowClick: (article: Article) => void;
  onDeleteClick: (article: Article) => void;
}

const TableRow = ({ article, onRowClick, onDeleteClick }: TableRowProps) => (
  <tr
    className="border-b border-jeton-red/5 last:border-none hover:bg-jeton-red/2 transition-colors cursor-pointer"
    onClick={() => onRowClick(article)}
  >
    <td className="px-5 py-2.5 font-medium text-text-black">{article.name}</td>
    <td
      className={cn(
        "px-5 py-2.5 text-red-velvet/70 tabular-nums",
        article.quantity <= 5 && "text-fiery-rose/70font-bold",
      )}
    >
      {article.quantity}
    </td>
    <td className="px-5 py-2.5 text-right">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick(article);
        }}
        className="text-fiery-rose/60 hover:text-jeton-red transition-colors text-xs font-medium p-2.5"
      >
        <FiTrash2 size={14} />
      </button>
    </td>
  </tr>
);

interface TableBodyProps {
  articles: Article[];
  onRowClick: (article: Article) => void;
  onDeleteClick: (article: Article) => void;
}

const TableBody = ({ articles, onRowClick, onDeleteClick }: TableBodyProps) => (
  <div className="flex-1 overflow-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-jeton-red/10">
          <th className="px-5 py-3.5 text-left font-medium text-red-velvet/60 text-xs uppercase tracking-[0.03em]">
            Nombre
          </th>
          <th className="px-5 py-3.5 text-left font-medium text-red-velvet/60 text-xs uppercase tracking-[0.03em]">
            Cantidad
          </th>
          <th className="px-5 py-3.5 text-right" />
        </tr>
      </thead>
      <tbody>
        {articles.map((article) => (
          <TableRow
            key={article.id}
            article={article}
            onRowClick={onRowClick}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </tbody>
    </table>
  </div>
);

interface PaginationProps {
  totalPages: number;
}

const Pagination = ({ totalPages }: PaginationProps) => {
  const $currentArticlesPage = useStore(currentArticlesPage);

  if (totalPages <= 1) {
    return <span className="text-xs text-red-velvet/30">Página 1 de 1</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        disabled={$currentArticlesPage.page <= 1}
        onClick={() =>
          currentArticlesPage.set({
            page: $currentArticlesPage.page - 1,
            version: $currentArticlesPage.version + 1,
          })
        }
        className="px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors disabled:text-red-velvet/30 disabled:pointer-events-none"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() =>
            currentArticlesPage.set({
              page: p,
              version: $currentArticlesPage.version + 1,
            })
          }
          className={
            p === $currentArticlesPage.page
              ? "px-3 py-1.5 text-sm rounded-lg bg-jeton-red text-canvas-white font-medium transition-colors"
              : "px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors"
          }
        >
          {p}
        </button>
      ))}

      <button
        disabled={$currentArticlesPage.page >= totalPages}
        onClick={() =>
          currentArticlesPage.set({
            page: $currentArticlesPage.page + 1,
            version: $currentArticlesPage.version + 1,
          })
        }
        className="px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors disabled:text-red-velvet/30 disabled:pointer-events-none"
      >
        Siguiente
      </button>
    </div>
  );
};

interface DeletePopupProps {
  article: Article | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePopup = ({ article, onClose, onConfirm }: DeletePopupProps) => (
  <Popup
    open={!!article}
    onClose={onClose}
    title="Eliminar artículo"
    description={
      article
        ? `¿Estás seguro de eliminar "${article.name}"? Esta acción no se puede deshacer.`
        : ""
    }
  >
    <Button variant="ghost" onClick={onClose}>
      Cancelar
    </Button>
    <Button variant="danger" onClick={onConfirm}>
      Eliminar
    </Button>
  </Popup>
);

export const ArticlesTable = () => {
  const $currentArticlesPage = useStore(currentArticlesPage);
  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const fetchArticles = useCallback(async (page = 1) => {
    setIsLoading(true);
    const { data: result } = await actions.article.getArticles({
      page,
      pageSize: 5,
    });
    if (result) setData(result);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles($currentArticlesPage.page);
  }, [fetchArticles, $currentArticlesPage]);

  const handleRowClick = (article: Article) => {
    inputArticle.set({
      name: article.name,
      quantity: article.quantity,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await actions.article.remove({ id: deleteTarget.id });
    setDeleteTarget(null);
    fetchArticles($currentArticlesPage.page);
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const showSkeleton = isLoading;
  const showEmpty = !isLoading && data?.articles.length === 0;
  const showTable = data && data.articles.length > 0 && !isLoading;

  return (
    <div className="flex flex-col flex-1">
      <TableHeader total={data?.total || 0} />

      {showSkeleton && <TableSkeleton />}
      {showEmpty && <TableEmpty />}
      {showTable && (
        <TableBody
          articles={data.articles}
          onRowClick={handleRowClick}
          onDeleteClick={setDeleteTarget}
        />
      )}

      <div className="px-5 py-3.5 border-t border-jeton-red/10 flex items-center justify-center">
        <Pagination totalPages={totalPages} />
      </div>

      <DeletePopup
        article={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
