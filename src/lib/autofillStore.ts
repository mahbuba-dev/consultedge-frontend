/**
 * On-device profile/autofill memory.
 *
 * Stores frequently-used form values (name, email, phone, etc.) in localStorage
 * so we can offer "Use saved name?" prompts and one-click autofill on booking,
 * contact, expert-application forms.
 *
 * Forward-compatible: when the user is logged in we can hydrate this store
 * from `/api/v1/users/me` instead of (or in addition to) localStorage.
 */

"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "consultedge:autofill:v1";

export interface AutofillProfile {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  /** Free-form goal/topic the user typed last time. */
  topic?: string;
  updatedAt?: number;
}

const isBrowser = () => typeof window !== "undefined" && !!window.localStorage;

function read(): AutofillProfile {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AutofillProfile;
  } catch {
    return {};
  }
}

function write(profile: AutofillProfile) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...profile, updatedAt: Date.now() }),
    );
    window.dispatchEvent(new CustomEvent("consultedge:autofill-updated"));
  } catch {
    /* ignore */
  }
}

export function getAutofillProfile(): AutofillProfile {
  return read();
}

export function rememberAutofill(patch: Partial<AutofillProfile>) {
  // Only persist non-empty values so we never wipe a previously-saved field.
  const current = read();
  const next: AutofillProfile = { ...current };
  for (const key of Object.keys(patch) as Array<keyof AutofillProfile>) {
    const val = patch[key];
    if (typeof val === "string" && val.trim().length > 0) {
      // @ts-expect-error narrow string assignment
      next[key] = val.trim();
    }
  }
  write(next);
}

export function clearAutofill() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("consultedge:autofill-updated"));
  } catch {
    /* ignore */
  }
}

/** React hook for components that want a reactive view of the profile. */
export function useAutofillProfile(): AutofillProfile {
  const [profile, setProfile] = useState<AutofillProfile>(() => read());

  useEffect(() => {
    const handler = () => setProfile(read());
    window.addEventListener("consultedge:autofill-updated", handler);
    return () => window.removeEventListener("consultedge:autofill-updated", handler);
  }, []);

  return profile;
}

/**
 * Returns a stable applier that fills a controlled form using `setField`.
 *
 * Example:
 *   const apply = useApplyAutofill((field, value) => handleChange(field, value));
 *   <button onClick={() => apply(["name", "email"])}>Use saved info</button>
 */
export function useApplyAutofill<K extends keyof AutofillProfile = keyof AutofillProfile>(
  setField: (field: K, value: string) => void,
) {
  return useCallback(
    (fields: K[]) => {
      const profile = read();
      for (const field of fields) {
        const val = profile[field];
        if (typeof val === "string" && val) setField(field, val);
      }
    },
    [setField],
  );
}
