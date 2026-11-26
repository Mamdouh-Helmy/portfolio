import { useId, cloneElement, type ReactElement } from "react";

export function Field({ label, error, children }: { label: string; error?: string | false; children: ReactElement<Record<string, unknown>> }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">{label}</label>
      {cloneElement(children, { id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-e` : undefined })}
      {error && <p id={`${id}-e`} className="mt-1 text-xs text-terra">{error}</p>}
    </div>
  );
}
