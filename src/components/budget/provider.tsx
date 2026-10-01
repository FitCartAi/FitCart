'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialDraft, readStoredDraft, sanitizeDraft, STORAGE_KEY, validateDraft, type Draft } from '@/lib/v2/profile';

type State = { draft: Draft; completed: boolean; remember: boolean };
type ContextValue = State & { ready: boolean; notice: string; update: (draft: Draft) => void; finish: () => boolean; setRemember: (value: boolean) => void; clear: () => void };
const Context = createContext<ContextValue | null>(null);
export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ draft: initialDraft(), completed: false, remember: false });
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let stored: ReturnType<typeof readStoredDraft> = null;
    try { stored = readStoredDraft(sessionStorage.getItem(STORAGE_KEY)); } catch { /* Memory mode remains available. */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client storage hydration
    if (stored) setState({ ...stored, remember: true });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR must not access browser storage
    setReady(true);
  }, []);
  function commit(next: State) {
    const clean = { ...next, draft: sanitizeDraft(next.draft) };
    setState(clean);
    try {
      if (clean.remember) sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, draft: clean.draft, completed: clean.completed }));
      else sessionStorage.removeItem(STORAGE_KEY);
      setNotice('');
    } catch { setNotice('Tab storage is unavailable. Keep this page open; refreshing may clear your answers.'); }
  }
  function finish() {
    if (Object.keys(validateDraft(state.draft)).length) return false;
    commit({ ...state, completed: true });
    return true;
  }
  return <Context.Provider value={{ ...state, ready, notice, update: draft => commit({ ...state, draft, completed: false }), finish, setRemember: remember => commit({ ...state, remember }), clear: () => commit({ draft: initialDraft(), completed: false, remember: false }) }}>{children}</Context.Provider>;
}
export function useBudget() {
  const context = useContext(Context);
  if (!context) throw new Error('BudgetProvider missing');
  return context;
}
