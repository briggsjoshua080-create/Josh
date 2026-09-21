/**
 * Picking up a new deploy on the first open, not the second.
 *
 * The service worker is built with `registerType: "autoUpdate"`, so a new
 * worker calls `skipWaiting()` and `clientsClaim()` and takes over the open
 * page immediately. What it does NOT do is re-render that page: the HTML, JS
 * and CSS already on screen came from the previous precache. So without this,
 * a returning user sees the old version on the open where the update lands and
 * the new one only on the open after that — which makes "is the app up to
 * date?" impossible for them to answer.
 *
 * Reloading is safe here specifically because the build is a single bundle with
 * no dynamic imports: there are no stale chunks for the old page to request
 * against a new precache.
 *
 * The one thing a reload must never do is interrupt a recording. Transcripts
 * live only in memory until the session is saved, and there is no draft
 * recovery, so a refresh mid-take destroys work the user cannot get back.
 */

let listening = false;
let holdsUnsavedWork = false;
let reloadPending = false;

/**
 * Tell the updater whether the screen is holding work that a reload would
 * destroy. Called by the recording screen for every phase that owns an
 * unsaved take.
 */
export function setHoldsUnsavedWork(holds: boolean): void {
  holdsUnsavedWork = holds;
  if (!holds && reloadPending) reload();
}

function reload(): void {
  reloadPending = false;
  window.location.reload();
}

/** Install the update listener. Idempotent — StrictMode mounts effects twice. */
export function watchForAppUpdates(): void {
  if (listening || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  listening = true;

  // A page with no controller is a first-ever visit: the worker installing and
  // claiming it is not an update, and what's on screen is already current.
  // Reloading there would be a spurious refresh on someone's first run.
  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (holdsUnsavedWork) {
      reloadPending = true;
      return;
    }
    reload();
  });
}
