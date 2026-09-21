import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The rule this encodes: pick up a new deploy on the first open rather than the
 * second, but never at the cost of a recording that exists only in memory.
 */
type Listener = () => void;

function mockServiceWorker(hasController: boolean) {
  const listeners: Listener[] = [];
  const reload = vi.fn();

  vi.stubGlobal("navigator", {
    serviceWorker: {
      controller: hasController ? {} : null,
      addEventListener: (event: string, fn: Listener) => {
        if (event === "controllerchange") listeners.push(fn);
      },
    },
  });
  vi.stubGlobal("window", { location: { reload } });

  return { fireControllerChange: () => listeners.forEach((fn) => fn()), reload };
}

async function freshModule() {
  vi.resetModules();
  return import("@/lib/appUpdate");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("watchForAppUpdates", () => {
  it("reloads when a new worker takes over a page that already had one", async () => {
    const { fireControllerChange, reload } = mockServiceWorker(true);
    const { watchForAppUpdates } = await freshModule();

    watchForAppUpdates();
    fireControllerChange();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload on a first-ever install", async () => {
    // No prior controller means this is the initial registration claiming the
    // page — what's on screen is already current, so a refresh would be noise.
    const { fireControllerChange, reload } = mockServiceWorker(false);
    const { watchForAppUpdates } = await freshModule();

    watchForAppUpdates();
    fireControllerChange();

    expect(reload).not.toHaveBeenCalled();
  });

  it("still updates a tab that was open for the first-ever install", async () => {
    // The install claims the page (no reload), then a deploy lands hours later
    // while that same tab is still open. Keying off the state at startup would
    // leave this tab stuck on the version it was born with.
    const { fireControllerChange, reload } = mockServiceWorker(false);
    const { watchForAppUpdates } = await freshModule();

    watchForAppUpdates();
    fireControllerChange(); // the first worker claims the page
    expect(reload).not.toHaveBeenCalled();

    fireControllerChange(); // a second worker replaces it — a real update
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("never reloads while a recording is unsaved", async () => {
    const { fireControllerChange, reload } = mockServiceWorker(true);
    const { watchForAppUpdates, setHoldsUnsavedWork } = await freshModule();

    watchForAppUpdates();
    setHoldsUnsavedWork(true);
    fireControllerChange();

    expect(reload).not.toHaveBeenCalled();
  });

  it("applies the held update as soon as the recording is finished", async () => {
    const { fireControllerChange, reload } = mockServiceWorker(true);
    const { watchForAppUpdates, setHoldsUnsavedWork } = await freshModule();

    watchForAppUpdates();
    setHoldsUnsavedWork(true);
    fireControllerChange();
    expect(reload).not.toHaveBeenCalled();

    setHoldsUnsavedWork(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload on leaving the recording screen when no update arrived", async () => {
    const { reload } = mockServiceWorker(true);
    const { watchForAppUpdates, setHoldsUnsavedWork } = await freshModule();

    watchForAppUpdates();
    setHoldsUnsavedWork(true);
    setHoldsUnsavedWork(false);

    expect(reload).not.toHaveBeenCalled();
  });

  it("registers only once even if called repeatedly", async () => {
    const { fireControllerChange, reload } = mockServiceWorker(true);
    const { watchForAppUpdates } = await freshModule();

    // StrictMode mounts effects twice; a double listener would double-reload.
    watchForAppUpdates();
    watchForAppUpdates();
    fireControllerChange();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("is a no-op where service workers are unavailable", async () => {
    vi.stubGlobal("navigator", {});
    const { watchForAppUpdates } = await freshModule();
    expect(() => watchForAppUpdates()).not.toThrow();
  });
});
