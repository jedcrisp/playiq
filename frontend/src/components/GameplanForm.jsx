import { FORM_FIELDS } from "../constants/formFields.js";
import SelectField from "./SelectField.jsx";

export default function GameplanForm({
  options,
  values,
  onChange,
  onSubmit,
  loading,
  error,
}) {
  const ready = options && FORM_FIELDS.every((f) => options[f.key]?.length);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-8"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {FORM_FIELDS.map((field) => (
          <SelectField
            key={field.key}
            id={field.key}
            label={field.label}
            value={values[field.key] || ""}
            onChange={(v) => onChange(field.key, v)}
            options={options?.[field.key] || []}
            disabled={!ready || loading}
          />
        ))}
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-zinc-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Outputs are deterministic from your inputs—extend the engine with new rule packs as
          your install grows.
        </p>
        <button
          type="submit"
          disabled={!ready || loading}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-8 text-sm font-semibold text-white shadow-glow transition hover:from-brand-500 hover:to-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2.5">
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white"
                aria-hidden
              />
              Generating…
            </span>
          ) : (
            "Generate plan"
          )}
        </button>
      </div>
    </form>
  );
}
