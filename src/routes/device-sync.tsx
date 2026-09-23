import { createFileRoute } from "@tanstack/react-router";
import { DeviceSync } from "@/components/device-sync";

export const Route = createFileRoute("/device-sync")({
  component: DeviceSync,
  head: () => ({ meta: [{ title: "Device Sync · Radio" }] }),
});
