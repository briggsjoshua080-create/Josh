import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { AppShell } from "./components/AppShell";
import { Today } from "./screens/Today";
import { Library } from "./screens/Library";
import { Session } from "./screens/Session";
import { Feedback } from "./screens/Feedback";
import { Progress } from "./screens/Progress";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
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
