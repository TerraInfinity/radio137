import { createContext, useContext, useState } from "react";
import { writeShrimpCookie } from "@/lib/shrimpify";

const ShrimpContext = createContext<{ on: boolean; toggle: () => void }>({
  on: false,
  toggle: () => undefined,
});

export function ShrimpProvider({ initial, children }: { initial: boolean; children: React.ReactNode }) {
  const [on, setOn] = useState(initial);
  function toggle() {
    setOn((value) => {
      const next = !value;
      writeShrimpCookie(next);
      if (typeof document !== "undefined") document.documentElement.dataset.shrimp = next ? "1" : "0";
      return next;
    });
  }
  return <ShrimpContext.Provider value={{ on, toggle }}>{children}</ShrimpContext.Provider>;
}

export function useShrimp(): boolean {
  return useContext(ShrimpContext).on;
}

export function useShrimpToggle(): () => void {
  return useContext(ShrimpContext).toggle;
}
