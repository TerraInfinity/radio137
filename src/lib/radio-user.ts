import { useEffect, useMemo, useState } from "react";
import { useCurrentUserState, type AppUser } from "@/lib/auth/use-current-user";
import { isAdminEmail } from "@/lib/admins";
import { getRadioSession } from "@/lib/desk-api";
import type { EnvLamp } from "@/lib/env-lamps";

export type RadioClientUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  isAdmin: boolean;
};

function fromAppUser(user: AppUser): RadioClientUser {
  return {
    id: user.id,
    email: user.primaryEmail,
    name: user.displayName,
    image: user.profileImageUrl,
    isAdmin: isAdminEmail(user.primaryEmail),
  };
}

export function useRadioUser() {
  const ba = useCurrentUserState();
  const [remote, setRemote] = useState<{
    user: RadioClientUser | null;
    r2Configured: boolean;
    lamps: EnvLamp[];
  } | null>(null);
  const [remotePending, setRemotePending] = useState(true);

  useEffect(() => {
    let alive = true;
    void getRadioSession()
      .then((data) => {
        if (!alive) return;
        setRemote({
          user: data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                image: data.user.image,
                isAdmin: data.user.isAdmin,
              }
            : null,
          r2Configured: data.r2Configured,
          lamps: data.lamps ?? [],
        });
      })
      .catch(() => {
        if (!alive) return;
        setRemote({ user: null, r2Configured: false, lamps: [] });
      })
      .finally(() => {
        if (alive) setRemotePending(false);
      });
    return () => {
      alive = false;
    };
  }, [ba.user?.id]);

  const user = useMemo(() => {
    if (remote?.user) return remote.user;
    if (ba.user) return fromAppUser(ba.user);
    return null;
  }, [ba.user, remote?.user]);

  return {
    user,
    isAdmin: Boolean(user?.isAdmin),
    r2Configured: Boolean(remote?.r2Configured),
    lamps: remote?.lamps ?? [],
    isPending: ba.isPending || remotePending,
  };
}

export function ssoLoginHref(next = "/"): string {
  const path = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return `/api/sso/login?next=${encodeURIComponent(path)}`;
}
