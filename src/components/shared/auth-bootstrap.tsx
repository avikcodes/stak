"use client";

import { useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store";

function syncAuthState(session: Session | null) {
  useAuthStore.getState().setAuthState({
    session,
    status: session ? "authenticated" : "anonymous",
    user: session?.user ?? null,
    token: session?.access_token ?? null,
  });
}

export function AuthBootstrap() {
  useEffect(() => {
    let active = true;

    useAuthStore.getState().setStatus("loading");

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }

        syncAuthState(data.session);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        syncAuthState(null);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return;
      }

      syncAuthState(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
