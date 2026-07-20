import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { resetAllData } from "@/lib/db";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/Button";
import type { Lang } from "@/lib/types";
import type { StringKey } from "@/lib/strings";

/** Everything the reset wipes, spelled out in the confirmation dialog. */
const RESET_ITEMS: StringKey[] = [
  "resetItemXp",
  "resetItemStreak",
  "resetItemHistory",
  "resetItemRecordings",
  "resetItemSettings",
];

export function Settings() {
  const { t, lang, setLang } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function reset() {
    setBusy(true);
    try {
      await resetAllData();
    } finally {
      // Hard reload: the app boots on empty stores, i.e. first-launch state.
      window.location.replace("/");
    }
  }

  return (
    <div className="pt-2 lg:pt-0">
      <h1 className="text-2xl font-semibold text-ink">{t("settingsTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("settingsSub")}</p>

      {/* Language */}
      <section className="mt-8">
        <h2 className="label-caps">{t("settingsLanguage")}</h2>
        <div className="mt-3 flex rounded-(--radius-card) border border-line bg-surface p-1" role="radiogroup">
          {(["en", "de"] as Lang[]).map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={lang === l}
              onClick={() => setLang(l)}
              className={`flex-1 rounded-(--radius-control) px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                lang === l ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {l === "en" ? "English" : "Deutsch"}
            </button>
          ))}
        </div>
      </section>

      {/* Data */}
      <section className="mt-10">
        <h2 className="label-caps">{t("settingsDataTitle")}</h2>
        <div className="mt-3 rounded-(--radius-card) border border-line bg-surface p-5">
          <h3 className="text-base font-medium text-ink">{t("resetDataTitle")}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("resetDataDesc")}</p>
          <Button
            variant="ghost"
            className="mt-4 border-bad/60 text-bad hover:bg-bad/10 active:bg-bad/15"
            onClick={() => setConfirming(true)}
          >
            {t("resetDataButton")}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={confirming}
        title={t("resetConfirmTitle")}
        confirmLabel={busy ? t("resetWorking") : t("resetConfirmYes")}
        cancelLabel={t("resetConfirmCancel")}
        busy={busy}
        onCancel={() => setConfirming(false)}
        onConfirm={reset}
      >
        <p className="font-medium text-ink">{t("resetConfirmBody")}</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
          {RESET_ITEMS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </ConfirmDialog>
    </div>
  );
}
