import { useEffect, useState } from "react";
import { useRadioUser } from "@/lib/radio-user";
import { usePlayerStore } from "@/lib/player-store";

function storageKey(slug: string) {
  return `radio.experience.unlock.${slug}`;
}

export function useExperienceUnlock(stationSlug: string | undefined | null) {
  const { isAdmin } = useRadioUser();
  const playingHere = usePlayerStore(
    (s) => Boolean(stationSlug) && s.channelSlug === stationSlug && s.status === "playing",
  );
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!stationSlug) return;
    try {
      if (window.sessionStorage.getItem(storageKey(stationSlug)) === "1") setOpened(true);
    } catch {
      /* ignore */
    }
  }, [stationSlug]);

  useEffect(() => {
    if (!stationSlug || !playingHere) return;
    setOpened(true);
    try {
      window.sessionStorage.setItem(storageKey(stationSlug), "1");
    } catch {
      /* ignore */
    }
  }, [playingHere, stationSlug]);

  return Boolean(isAdmin || opened);
}
