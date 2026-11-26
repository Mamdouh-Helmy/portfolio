import type { FieldErrors } from "./validation";

export class ApiError extends Error {
  constructor(public status: number, public fields?: FieldErrors) { super(`API ${status}`); }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const isForm = init?.body instanceof FormData;
  const res = await fetch(url, {
    ...init,
    headers: isForm ? init?.headers : { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.fields);
  return data as T;
}
