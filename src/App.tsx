import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { AppShell } from "./components/AppShell";
import OratoSplash from "./components/OratoSplash";
import { Today } from "./screens/Today";
import { Scenarios } from "./screens/Scenarios";
import { Library } from "./screens/Library";
import { Session } from "./screens/Session";
import { Feedback } from "./screens/Feedback";
import { Progress } from "./screens/Progress";
import { Settings } from "./screens/Settings";

const SPLASH_SEEN_KEY = "orato.splashSeen";

export default function App() {
  // Launch splash: covers the app (fixed, z-9999) while it boots underneath,
  // so there is never a white flash. The full orchestrated sequence is worth
  // seeing once — showing it again on every daily open would just be 3.4s of
  // dead time for a habit app, so it's skipped once the device has seen it.
  const [splash, setSplash] = useState(() => {
    try {
      return !localStorage.getItem(SPLASH_SEEN_KEY);
    } catch {
      return true;
    }
  });

  function finishSplash() {
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, "1");
    } catch {
      /* private browsing / storage disabled — just don't persist the flag */
    }
    setSplash(false);
  }

  return (
    <MotionConfig reducedMotion="user">
      {splash && <OratoSplash onDone={finishSplash} />}
      <AppShell>
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/library" element={<Library />} />
          <Route path="/session" element={<Session />} />
          <Route path="/feedback/:id" element={<Feedback />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </MotionConfig>
  );
}
