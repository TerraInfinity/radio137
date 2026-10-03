import { createContext, useCallback, useContext, useState } from "react";
import { writeShrimpCookie } from "@/lib/shrimpify";

const ShrimpContext = createContext<{ on: boolean; setShrimp: (next: boolean) => void }>({
  on: false,
  setShrimp: () => undefined,
});

export function ShrimpProvider({ initial, children }: { initial: boolean; children: React.ReactNode }) {
  const [on, setOn] = useState(initial);
  const setShrimp = useCallback((next: boolean) => {
    writeShrimpCookie(next);
    if (typeof document !== "undefined") document.documentElement.dataset.shrimp = next ? "1" : "0";
    setOn(next);
  }, []);
  return <ShrimpContext.Provider value={{ on, setShrimp }}>{children}</ShrimpContext.Provider>;
}

export function useShrimp(): boolean {
  return useContext(ShrimpContext).on;
}

export function useSetShrimp(): (next: boolean) => void {
  return useContext(ShrimpContext).setShrimp;
}