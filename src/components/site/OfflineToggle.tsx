import { Loader2, WifiOff } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { useLang } from "@/lib/i18n";
import { useOffline } from "@/lib/offline";

export function OfflineToggle() {
  const { t } = useLang();
  const { offline, setOffline } = useOffline();
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 border-primary/25 bg-card px-4">
      <span className="whitespace-nowrap text-lg font-bold text-primary">{t("offlineLabel")}</span>
      <Switch checked={offline} onCheckedChange={setOffline} className="h-8 w-14 data-[state=checked]:bg-saffron [&>span]:size-7 [&>span]:data-[state=checked]:translate-x-6" />
    </label>
  );
}

export function OfflineBadge() {
  const { t } = useLang();
  const { offline, engine, queued } = useOffline();
  if (!offline) return null;
  return (
    <div role="status" className="border-b-2 border-saffron/40 bg-saffron-soft">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 text-lg font-semibold text-accent-foreground">
        {engine === "preparing" ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <WifiOff className="size-6" aria-hidden />}
        <span>{engine === "preparing" ? t("offlinePreparing") : t("offlineBadge")}</span>
        {queued > 0 && (
          <span className="rounded-full bg-saffron px-3 py-0.5 text-base font-bold text-saffron-foreground">
            {queued} {t("offlineQueued")}
          </span>
        )}
      </div>
    </div>
  );
}
