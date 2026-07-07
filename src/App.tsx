import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { AppShell } from "./components/AppShell";
import OratoSplash from "./components/OratoSplash";
import { Today } from "./screens/Today";
import { Library } from "./screens/Library";
import { Session } from "./screens/Session";
import { Feedback } from "./screens/Feedback";
import { Progress } from "./screens/Progress";

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
          <Route path="/library" element={<Library />} />
          <Route path="/session" element={<Session />} />
          <Route path="/feedback/:id" element={<Feedback />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </AppShell>
    </MotionConfig>
  );
}
