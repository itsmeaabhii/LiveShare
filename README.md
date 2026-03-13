<div align="center">

# 🚀 NexusCode

### Real-time Collaborative Code Editor

**Write code together, instantly — no setup, no accounts, just share a link.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-liveshare--production.up.railway.app-6366f1?style=for-the-badge&logo=railway)](https://liveshare-production.up.railway.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features

- ⚡ **Real-time collaboration** — multiple users editing the same file simultaneously
- 🗂️ **Virtual file system** — create, rename, and delete files in the sidebar
- 🎨 **Monaco Editor** — the same editor that powers VS Code
- 🔗 **Shareable rooms** — each session gets a unique URL, just share it
- 🌙 **Dark theme** — easy on the eyes during long sessions
- 📡 **CRDT-based sync** — conflict-free merging via Yjs, no data loss

---

## 🌐 Live Demo

👉 **[liveshare-production.up.railway.app](https://liveshare-production.up.railway.app)**

Open the link in two browser tabs and start typing — changes sync instantly.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Editor | Monaco Editor + y-monaco binding |
| Realtime Sync | Yjs (CRDT) + y-websocket |
| State | Zustand |
| Styling | Tailwind CSS + Shadcn/UI |
| Deployment | Railway |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & Install

```bash
git clone https://github.com/itsmeaabhii/LiveShare.git
cd LiveShare
npm install
```

### 2. Start the WebSocket Server

```bash
npm run server
```

Starts the collaboration server on `ws://localhost:1234`.

### 3. Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> Open the same URL in multiple tabs to test real-time collaboration.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Shared UI components
├── features/
│   ├── collaboration/      # Yjs provider, hooks, awareness
│   ├── editor/             # Monaco editor component
│   └── file-explorer/      # Virtual file system sidebar
├── stores/                 # Zustand state stores
├── lib/                    # Utility functions
└── types/                  # Shared TypeScript types
server/
└── index.ts                # y-websocket collaboration server
```

---

## ⚙️ Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `wss://your-ws-server.up.railway.app` |

---

## 🤝 Contributing

Pull requests are welcome! Feel free to open an issue for bugs or feature requests.

---

<div align="center">

Made with ❤️ by [Abhishek](https://github.com/itsmeaabhii)

</div>
