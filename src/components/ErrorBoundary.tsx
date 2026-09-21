import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Last line of defence. Without one of these, any render-time throw unmounts
 * the whole root and the user gets a blank page with no explanation and no
 * way forward — the worst failure mode for a local-only app, where "is my
 * data gone or is it just broken?" is unanswerable.
 *
 * It sits ABOVE the language provider, so it cannot use useI18n (the provider
 * is one of the things it exists to catch). Copy is picked straight off
 * navigator.language instead, and every colour is a literal because a failure
 * this deep may be the stylesheet itself.
 */
const COPY = {
  en: {
    title: "Something went wrong",
    body: "The app hit an unexpected error. Your saved practice sessions are stored on this device and have not been deleted.",
    action: "Reload the app",
  },
  de: {
    title: "Etwas ist schiefgelaufen",
    body: "Die App ist auf einen unerwarteten Fehler gestoßen. Deine gespeicherten Übungen liegen auf diesem Gerät und wurden nicht gelöscht.",
    action: "App neu laden",
  },
} as const;

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    const copy = navigator.language?.toLowerCase().startsWith("de") ? COPY.de : COPY.en;
    return (
      <div
        role="alert"
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "#170609",
          color: "#efdfbb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.375rem", fontWeight: 600 }}>{copy.title}</h1>
        <p style={{ maxWidth: "32ch", lineHeight: 1.6, color: "#c9a876" }}>{copy.body}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            minHeight: 44,
            padding: "0 20px",
            borderRadius: 999,
            border: "1px solid #7a5a31",
            background: "#4a1420",
            color: "#efdfbb",
            font: "inherit",
            cursor: "pointer",
          }}
        >
          {copy.action}
        </button>
      </div>
    );
  }
}
