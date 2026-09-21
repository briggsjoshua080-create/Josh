import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
// Logotype face for the launch wordmark only (see --font-logotype in theme.css).
import "@fontsource-variable/bodoni-moda";
import "./styles/theme.css";
import App from "./App";
import { LanguageProvider } from "./lib/i18n";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { watchForAppUpdates } from "./lib/appUpdate";

// Before render: a new service worker can claim the page at any moment, and the
// listener has to be in place to notice.
watchForAppUpdates();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Outside the providers: a throw inside one of them is exactly the case
        that used to blank the page. */}
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
