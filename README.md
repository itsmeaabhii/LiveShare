# NexusCode

A high-performance, live collaborative code editor built with Next.js, Monaco Editor, and Yjs CRDTs.

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Running the WebSocket Server

```bash
npm run server
```

The collaboration server starts on `ws://localhost:1234`.

### Running the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in multiple browser tabs to test collaboration.

## Architecture

- **Yjs (CRDT)** – Conflict-free replicated data types for real-time document syncing
- **y-websocket** – WebSocket transport for Yjs updates
- **Monaco Editor** – VS Code's editor component with y-monaco binding
- **Zustand** – Lightweight UI state management
- **Shadcn/UI** – Accessible UI primitives

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/ui/          # Shadcn/UI primitives
├── features/
│   ├── collaboration/      # Yjs provider, hooks, awareness
│   ├── editor/             # Monaco editor component
│   └── file-explorer/      # Virtual file system sidebar
├── lib/                    # Utilities
└── types/                  # Shared TypeScript interfaces
server/
└── index.ts                # y-websocket server
```
