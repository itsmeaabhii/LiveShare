import { create } from "zustand";
import type { VirtualFile, CollabUser, AwarenessState } from "@/types";

// ─── File Explorer Store ────────────────────────────────────────

interface FileExplorerState {
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
}

export const useFileExplorerStore = create<FileExplorerState>((set) => ({
  activeFileId: null,
  setActiveFileId: (id) => set({ activeFileId: id }),
}));

// ─── Awareness Store ────────────────────────────────────────────

interface AwarenessStoreState {
  peers: Map<number, AwarenessState>;
  setPeers: (peers: Map<number, AwarenessState>) => void;
}

export const useAwarenessStore = create<AwarenessStoreState>((set) => ({
  peers: new Map(),
  setPeers: (peers) => set({ peers: new Map(peers) }),
}));

// ─── Connection Status Store ────────────────────────────────────

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: "connecting",
  setStatus: (status) => set({ status }),
}));
