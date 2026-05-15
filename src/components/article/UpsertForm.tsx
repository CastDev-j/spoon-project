import { actions, ActionError } from "astro:actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useRef, useCallback } from "react";
import { FiPackage } from "react-icons/fi";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "@/lib/cn";
import { articleSchemaZod } from "@/interface/article";

interface FormFieldProps {
  label: string;
  id: string;
  error?: { message?: string };
  dirty: boolean;
  children: React.ReactNode;
}

const FormField = ({ label, id, error, dirty, children }: FormFieldProps) => (
  <div className="text-sm flex flex-col gap-0.5">
    <label htmlFor={id} className="font-medium text-red-velvet/80">
      {label}
    </label>
    {children}
    <p
      className={cn(
        "text-[11px] transition-opacity min-h-3.5 leading-tight",
        error ? "opacity-100 text-jeton-red" : "opacity-0",
      )}
    >
      {error?.message}
    </p>
  </div>
);

export const UpsertForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: {
      errors,
      isSubmitting,
      isValid,
      isDirty,
      isSubmitSuccessful,
      dirtyFields,
    },
  } = useForm({
    resolver: zodResolver(articleSchemaZod),
    mode: "onChange",
  });

  const [suggestions, setSuggestions] = useState<
    { name: string; quantity: number }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState(false);
  const nameValue = watch("name");
  const lastSelectedRef = useRef<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSubmitSuccessful) {
      const timer = setTimeout(() => {
        reset();
        setSelected(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitSuccessful, reset]);

  useEffect(() => {
    if (
      lastSelectedRef.current !== null &&
      nameValue !== lastSelectedRef.current
    ) {
      setSelected(false);
      lastSelectedRef.current = null;
    }
  }, [nameValue]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { name, quantity } = (e as CustomEvent).detail;
      setValue("name", name, { shouldDirty: true, shouldValidate: true });
      setValue("quantity", quantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
      lastSelectedRef.current = name;
      setSelected(true);
    };
    window.addEventListener("articles:edit", handler);
    return () => window.removeEventListener("articles:edit", handler);
  }, [setValue]);

  useEffect(() => {
    if (selected || !nameValue || nameValue.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await actions.article.getArticles({
        keyword: nameValue,
      });
      if (data?.articles) {
        setSuggestions(data.articles);
        setShowSuggestions(data.articles.length > 0);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nameValue, selected]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (article: { name: string; quantity: number }) => {
      setValue("name", article.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("quantity", article.quantity, {
        shouldDirty: true,
        shouldValidate: true,
      });
      lastSelectedRef.current = article.name;
      setSelected(true);
      setShowSuggestions(false);
    },
    [setValue],
  );

  const updating = selected;

  return (
    <>
      <div className="px-4 py-3 border-b border-jeton-red/10 flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-jeton-red/10 flex items-center justify-center">
          <FiPackage className="text-jeton-red" size={14} />
        </div>
        <h2 className="text-sm font-medium tracking-[0.01em] text-text-black">
          {updating ? "Actualizar artículo" : "Nuevo artículo"}
        </h2>
      </div>

      <form
        className="p-4 flex flex-col gap-1.5"
        onSubmit={handleSubmit(async ({ name, quantity }) => {
          const { data, error } = await actions.article.upsert({
            name,
            quantity,
          });

          if (error instanceof ActionError) {
            setError("form", {
              message: error.message,
            });
            return;
          }

          window.dispatchEvent(new CustomEvent("articles:change"));
        })}
      >
        <FormField
          label="Nombre"
          id="name"
          error={errors.name}
          dirty={!!dirtyFields.name}
        >
          <div ref={wrapperRef} className="relative">
            <Input
              id="name"
              placeholder="Nombre del premio..."
              autoComplete="off"
              error={!!errors.name}
              success={dirtyFields.name && !errors.name}
              {...register("name", { required: true })}
            />
            {showSuggestions && (
              <ul className="absolute z-10 mt-1 w-full rounded-2xl border border-jeton-red/20 bg-canvas-white shadow-md max-h-44 overflow-y-auto">
                {suggestions.map((article) => (
                  <li
                    key={article.name}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-jeton-red/5 transition-colors flex items-center justify-between"
                    onMouseDown={() => handleSelect(article)}
                  >
                    <span className="font-medium text-text-black">
                      {article.name}
                    </span>
                    <span className="text-xs text-red-velvet/50 tabular-nums">
                      {article.quantity} uds.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FormField>

        <FormField
          label="Cantidad"
          id="quantity"
          error={errors.quantity}
          dirty={!!dirtyFields.quantity}
        >
          <Input
            id="quantity"
            placeholder="0"
            type="number"
            {...register("quantity", { required: true, valueAsNumber: true })}
            error={!!errors.quantity}
            success={dirtyFields.quantity && !errors.quantity}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || isSubmitSuccessful || !isValid}
          className="w-full"
        >
          {isSubmitSuccessful
            ? "¡Artículo guardado!"
            : isSubmitting
              ? "Guardando..."
              : updating
                ? "Actualizar artículo"
                : "Crear artículo"}
        </Button>

        <p
          className={cn(
            "text-[11px] transition-opacity text-center min-h-3.5 leading-tight",
            errors.form ? "opacity-100 text-jeton-red" : "opacity-0",
          )}
        >
          {errors.form?.message}
        </p>
      </form>
    </>
  );
};
