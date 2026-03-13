import React, { Suspense } from "react";
import ClientWorkspacePage from "./ClientWorkspacePage";

// Force dynamic rendering because we rely on runtime URL params (room id)
export const dynamic = "force-dynamic";
export const revalidate = false;

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Preparing workspace…</span>
          </div>
        </div>
      }
    >
      <ClientWorkspacePage />
    </Suspense>
  );
}
