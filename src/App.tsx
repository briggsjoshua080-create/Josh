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

export default function App() {
  // Launch splash: covers the app (fixed, z-9999) while it boots underneath,
  // so there is never a white flash. Shown once per launch.
  const [splash, setSplash] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      {splash && <OratoSplash onDone={() => setSplash(false)} />}
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
