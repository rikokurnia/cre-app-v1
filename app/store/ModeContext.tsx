"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AppMode = "FREE" | "CORE";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isCore: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>("FREE");

  // Load persisted mode on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("nova_mode") as AppMode;
    if (savedMode === "FREE" || savedMode === "CORE") {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem("nova_mode", newMode);
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, isCore: mode === "CORE" }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
