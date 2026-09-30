"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { emptyDraft, readStoredDraft, type Draft } from "@/lib/profile";

const KEY = "fitcart.onboarding.v1";
type ProfileState = { draft: Draft; completed: boolean; remember: boolean };
type ProfileContextValue = ProfileState & {
  ready: boolean; notice: string; update: (draft: Draft) => void;
  finish: () => void; setRemember: (value: boolean) => void; clear: () => void;
};
const Context = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>({ draft: emptyDraft(), completed: false, remember: false });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    // Hydrate only after mounting: server rendering must not read browser storage.
    let stored: ReturnType<typeof readStoredDraft> = null;
    try { stored = readStoredDraft(sessionStorage.getItem(KEY)); } catch { /* Memory mode still works. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time browser-storage hydration
    if (stored) setState({ ...stored, remember: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark browser hydration complete
    setReady(true);
  }, []);

  function commit(next: ProfileState) {
    setState(next);
    try {
      if (next.remember) sessionStorage.setItem(KEY, JSON.stringify({ version: 1, draft: next.draft, completed: next.completed }));
      else sessionStorage.removeItem(KEY);
      setNotice("");
    } catch { setNotice("Browser storage is unavailable. Your answers still work on this page, but may not survive a refresh. Close this tab after testing."); }
  }
  return <Context.Provider value={{ ...state, ready, notice, update: draft => commit({ ...state, draft, completed: false }), finish: () => commit({ ...state, completed: true }), setRemember: remember => commit({ ...state, remember }), clear: () => commit({ draft: emptyDraft(), completed: false, remember: false }) }}>{children}</Context.Provider>;
}
export function useProfile() {
  const value = useContext(Context);
  if (!value) throw new Error("ProfileProvider is required.");
  return value;
}
