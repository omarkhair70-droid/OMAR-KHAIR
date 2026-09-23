"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type SoundMode = "undecided" | "on" | "off";

type ExhibitionSession = {
  soundMode: SoundMode;
  visitedRooms: string[];
  roomOrder: string[];
  roomResidues: Record<string, string | number | boolean>;
};

type ExhibitionContextValue = ExhibitionSession & {
  audioContext: AudioContext | null;
  enterWithSound: () => Promise<void>;
  enterInSilence: () => Promise<void>;
  toggleSound: () => Promise<void>;
  markVisited: (slug: string) => void;
  setResidue: (slug: string, value: string | number | boolean) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "omar-khair-exhibition-session-v1";

const initialSession: ExhibitionSession = {
  soundMode: "undecided",
  visitedRooms: [],
  roomOrder: [],
  roomResidues: {}
};

const ExhibitionContext = createContext<ExhibitionContextValue | null>(null);

export function ExhibitionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ExhibitionSession>(initialSession);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ExhibitionSession>;
        setSession({
          soundMode: parsed.soundMode ?? "undecided",
          visitedRooms: Array.isArray(parsed.visitedRooms) ? parsed.visitedRooms : [],
          roomOrder: Array.isArray(parsed.roomOrder) ? parsed.roomOrder : [],
          roomResidues: parsed.roomResidues ?? {}
        });
      }
    } catch {
      // Session continuity is optional. The exhibition remains complete without storage.
    } finally {
      hydratedRef.current = true;
    }

    return () => {
      void audioRef.current?.close();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Storage failure must not block the experience.
    }
  }, [session]);

  const ensureAudioContext = useCallback(async () => {
    let context = audioRef.current;
    if (!context) {
      context = new AudioContext();
      audioRef.current = context;
      setAudioContext(context);
    }
    if (context.state === "suspended") {
      await context.resume();
    }
    return context;
  }, []);

  const enterWithSound = useCallback(async () => {
    await ensureAudioContext();
    setSession((current) => ({ ...current, soundMode: "on" }));
  }, [ensureAudioContext]);

  const enterInSilence = useCallback(async () => {
    const context = audioRef.current;
    if (context?.state === "running") await context.suspend();
    setSession((current) => ({ ...current, soundMode: "off" }));
  }, []);

  const toggleSound = useCallback(async () => {
    if (session.soundMode === "on") {
      const context = audioRef.current;
      if (context?.state === "running") await context.suspend();
      setSession((current) => ({ ...current, soundMode: "off" }));
      return;
    }

    await ensureAudioContext();
    setSession((current) => ({ ...current, soundMode: "on" }));
  }, [ensureAudioContext, session.soundMode]);

  const markVisited = useCallback((slug: string) => {
    setSession((current) => {
      if (current.visitedRooms.includes(slug)) return current;
      return {
        ...current,
        visitedRooms: [...current.visitedRooms, slug],
        roomOrder: [...current.roomOrder, slug]
      };
    });
  }, []);

  const setResidue = useCallback((slug: string, value: string | number | boolean) => {
    setSession((current) => ({
      ...current,
      roomResidues: { ...current.roomResidues, [slug]: value }
    }));
  }, []);

  const clearSession = useCallback(() => {
    void audioRef.current?.close();
    audioRef.current = null;
    setAudioContext(null);
    setSession(initialSession);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // No-op.
    }
  }, []);

  const value = useMemo<ExhibitionContextValue>(
    () => ({
      ...session,
      audioContext,
      enterWithSound,
      enterInSilence,
      toggleSound,
      markVisited,
      setResidue,
      clearSession
    }),
    [
      session,
      audioContext,
      enterWithSound,
      enterInSilence,
      toggleSound,
      markVisited,
      setResidue,
      clearSession
    ]
  );

  return <ExhibitionContext.Provider value={value}>{children}</ExhibitionContext.Provider>;
}

export function useExhibition() {
  const value = useContext(ExhibitionContext);
  if (!value) {
    throw new Error("useExhibition must be used within ExhibitionProvider");
  }
  return value;
}
