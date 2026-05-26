import {
  actions,
  ActionError,
  isInputError,
  isActionError,
} from "astro:actions";
import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { cn } from "@/lib/cn";

interface Prize {
  id: string;
  name: string;
  quantity: number;
}

interface SpoonResult {
  spoon: number;
  prizes: Prize[];
}

interface SpoonResponse {
  results: SpoonResult[];
}

export const SpoonPurchase = () => {
  const [spoons, setSpoons] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SpoonResponse | null>(null);

  const handlePurchase = async () => {
    setLoading(true);
    setError(null);

    const { data, error: actionError } = await actions.spoon.generate({
      spoons,
    });

    if (actionError instanceof ActionError) {
      if (isInputError(actionError)) {
        setError(actionError.issues[0].message);
        setLoading(false);
        return;
      } else if (isActionError(actionError)) {
        setError(actionError.message);
        setLoading(false);
        return;
      } else {
        setError("Error desconocido");
        setLoading(false);
        return;
      }
    }

    if (data) {
      setResults(data);
    }

    setLoading(false);
  };

  if (results) {
    return (
      <div className="flex flex-col w-full gap-6">
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setSpoons(1);
            }}
            className="text-sm text-red-velvet/50 hover:text-jeton-red transition-colors"
          >
            ← Volver a comprar
          </button>
        </div>

        <div className="w-full bg-canvas-white rounded-2xl border border-jeton-red/10 overflow-hidden">
          <pre className="text-xs text-red-velvet/80 leading-relaxed whitespace-pre-wrap wrap-break-word p-4 max-h-80 overflow-y-auto font-mono">
            <code>{JSON.stringify(results.results, null, 2)}</code>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full gap-8">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h2 className="text-2xl font-bold text-text-black">Comprar Cucharas</h2>
        <p className="text-sm text-red-velvet/60 leading-relaxed max-w-xs">
          Cada cuchara son 10 premios.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex items-center gap-5">
          <button
            type="button"
            disabled={spoons <= 1}
            onClick={() => setSpoons((prev) => Math.max(1, prev - 1))}
            className={cn(
              "size-14 rounded-full flex items-center justify-center transition-all",
              "bg-canvas-white border-2 border-jeton-red/20 text-jeton-red",
              "hover:bg-jeton-red hover:text-canvas-white hover:border-jeton-red",
              "active:scale-95",
              "disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-jeton-red disabled:hover:border-jeton-red/20",
              "shadow-sm",
            )}
          >
            <FiMinus size={24} />
          </button>

          <div className="flex flex-col items-center gap-1 min-w-24">
            <span className="text-6xl font-bold tabular-nums text-jeton-red leading-none">
              {spoons}
            </span>
            <span className="text-[11px] font-medium text-red-velvet/50 uppercase tracking-wider">
              cuchara{spoons !== 1 ? "s" : ""}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSpoons((prev) => Math.min(99, prev + 1))}
            className={cn(
              "size-14 rounded-full flex items-center justify-center transition-all",
              "bg-canvas-white border-2 border-jeton-red/20 text-jeton-red",
              "hover:bg-jeton-red hover:text-canvas-white hover:border-jeton-red",
              "active:scale-95",
              "shadow-sm",
            )}
          >
            <FiPlus size={24} />
          </button>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handlePurchase}
          className={cn(
            "w-full py-4 rounded-2xl text-lg font-bold tracking-wide transition-all",
            "border-2 border-jeton-red bg-canvas-white text-jeton-red",
            "hover:bg-jeton-red hover:text-canvas-white",
            "active:scale-[0.98]",
            "disabled:opacity-40 disabled:pointer-events-none",
            "shadow-sm",
          )}
        >
          {loading ? "Comprando..." : "Comprar Cucharas"}
        </button>

        {error && (
          <div className="w-full bg-jeton-red/5 border border-jeton-red/20 rounded-xl px-4 py-3">
            <p className="text-xs text-jeton-red text-center leading-relaxed">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
