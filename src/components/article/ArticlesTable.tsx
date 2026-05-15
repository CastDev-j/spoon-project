import { actions } from "astro:actions";
import { useState, useEffect, useCallback } from "react";
import { FiTrash2 } from "react-icons/fi";
import { Popup } from "../ui/Popup";
import { Button } from "../ui/Button";

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

export const ArticlesTable = () => {
  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    const { data: result } = await actions.article.getArticles({
      page,
      pageSize: 5,
    });
    if (result) setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  useEffect(() => {
    const handler = () => fetchArticles(data?.page || 1);
    window.addEventListener("articles:change", handler);
    return () => window.removeEventListener("articles:change", handler);
  }, [fetchArticles, data?.page]);

  const handleRowClick = (article: Article) => {
    window.dispatchEvent(
      new CustomEvent("articles:edit", {
        detail: { name: article.name, quantity: article.quantity },
      }),
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await actions.article.remove({ id: deleteTarget.id });
    setDeleteTarget(null);
    fetchArticles(data?.page || 1);
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const currentPage = data?.page || 1;

  return (
    <div className="flex flex-col flex-1">
      <div className="px-5 py-4 border-b border-jeton-red/10 flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-[0.01em] text-text-black">
          Artículos registrados
        </h2>
        <span className="text-xs text-red-velvet/50">
          {data ? data.total : "—"} en total
        </span>
      </div>

      {loading && !data && (
        <div className="p-5 space-y-3 flex-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 bg-jeton-red/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && data?.articles.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-red-velvet/40 text-sm">
          No hay artículos registrados
        </div>
      )}

      {data && data.articles.length > 0 && (
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
              {data.articles.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-jeton-red/5 last:border-none hover:bg-jeton-red/2 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(a)}
                >
                  <td className="px-5 py-2.5 font-medium text-text-black">
                    {a.name}
                  </td>
                  <td className="px-5 py-2.5 text-red-velvet/70 tabular-nums">
                    {a.quantity}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(a);
                      }}
                      className="text-fiery-rose/60 hover:text-jeton-red transition-colors text-xs font-medium p-2.5"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-3.5 border-t border-jeton-red/10 flex items-center justify-center gap-1">
        {totalPages > 1 && (
          <>
            <button
              disabled={currentPage <= 1}
              onClick={() => fetchArticles(currentPage - 1)}
              className="px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors disabled:text-red-velvet/30 disabled:pointer-events-none"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchArticles(p)}
                className={
                  p === currentPage
                    ? "px-3 py-1.5 text-sm rounded-lg bg-jeton-red text-canvas-white font-medium transition-colors"
                    : "px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors"
                }
              >
                {p}
              </button>
            ))}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => fetchArticles(currentPage + 1)}
              className="px-3 py-1.5 text-sm rounded-lg text-red-velvet/70 hover:bg-jeton-red/5 transition-colors disabled:text-red-velvet/30 disabled:pointer-events-none"
            >
              Siguiente
            </button>
          </>
        )}
        {totalPages <= 1 && (
          <span className="text-xs text-red-velvet/30">Página 1 de 1</span>
        )}
      </div>

      <Popup
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar artículo"
        description={
          deleteTarget
            ? `¿Estás seguro de eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ""
        }
      >
        <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Eliminar
        </Button>
      </Popup>
    </div>
  );
};
