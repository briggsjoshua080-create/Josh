import { useI18n } from "@/lib/i18n";
import { Button } from "./Button";
import { Icon } from "./Icon";

/**
 * Shown when a screen's IndexedDB read fails. The alternative — which is what
 * every screen did before — is an endless skeleton: no message, no exit, and
 * no way for the user to tell whether their history is gone or the app is
 * just stuck. Says the data is still there, and offers a real retry that
 * re-runs the read rather than reloading the page.
 */
export function LoadError({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="box mt-8 flex flex-col items-center gap-4 p-6 text-center" role="alert">
      <Icon name="info" size={22} className="text-bad" />
      <p className="text-base font-medium text-ink">{t("dataUnavailableTitle")}</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted" style={{ overflowWrap: "break-word" }}>
        {t("dataUnavailableBody")}
      </p>
      <Button variant="ghost" onClick={onRetry}>
        <Icon name="refresh" size={16} />
        {t("retry")}
      </Button>
    </div>
  );
}
