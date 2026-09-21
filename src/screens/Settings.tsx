import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { isStoragePersisted, resetAllData } from "@/lib/db";
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
  const [resetFailed, setResetFailed] = useState(false);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    isStoragePersisted().then((p) => alive && setPersisted(p));
    return () => {
      alive = false;
    };
  }, []);

  async function reset() {
    setBusy(true);
    setResetFailed(false);
    try {
      await resetAllData();
      // Hard reload only on success: the app boots on empty stores, i.e.
      // first-launch state.
      window.location.replace("/");
    } catch (err) {
      // Reloading here would show the user a "fresh" app with their data still
      // on disk, right after a dialog promising the wipe was permanent. The
      // usual cause is another tab holding the database open.
      console.error("Settings: reset failed", err);
      setBusy(false);
      setResetFailed(true);
    }
  }

  return (
    <div className="pt-2 lg:pt-0">
      <h1 className="text-2xl font-semibold text-ink">{t("settingsTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("settingsSub")}</p>

      {/* Language */}
      <section className="mt-8">
        <h2 className="label-caps">{t("settingsLanguage")}</h2>
        {/* aria-pressed buttons, not role="radio": a radiogroup owes the user
            arrow-key navigation over a single tab stop, which these never had.
            Tabbing to each button and pressing it is the behaviour that is
            actually implemented here. */}
        <div className="mt-3 flex box p-1" role="group" aria-label={t("settingsLanguage")}>
          {(["en", "de"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
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

      {/* Storage — this device holds the only copy, so its durability is worth stating. */}
      {persisted !== null && (
        <section className="mt-10">
          <h2 className="label-caps">{t("storageTitle")}</h2>
          <div className="mt-3 box p-5">
            <p className="text-sm leading-relaxed text-muted">
              {persisted ? t("storagePersisted") : t("storageBestEffort")}
            </p>
          </div>
        </section>
      )}

      {/* Data */}
      <section className="mt-10">
        <h2 className="label-caps">{t("settingsDataTitle")}</h2>
        <div className="mt-3 box p-5">
          <h3 className="text-base font-medium text-ink">{t("resetDataTitle")}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{t("resetDataDesc")}</p>
          {resetFailed && (
            <p role="alert" className="mt-3 rounded-(--radius-control) bg-bad/10 px-4 py-3 text-sm text-bad">
              {t("resetFailed")}
            </p>
          )}
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
