"use client";

import { Player } from "@remotion/player";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export function ForecastVideoScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: { damping: 100 } });
  const width = interpolate(progress, [0, 1], [10, 90]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617", color: "#e2e8f0", padding: 32, fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: 44, marginBottom: 18 }}>Oil & Gas Forecast</h2>
      <p style={{ marginBottom: 16 }}>Animated production trend preview generated with Remotion.</p>
      <div style={{ width: "100%", height: 24, backgroundColor: "#1e293b", borderRadius: 9999 }}>
        <div style={{ width: `${width}%`, height: "100%", borderRadius: 9999, background: "linear-gradient(90deg, #2563eb, #22c55e)" }} />
      </div>
    </AbsoluteFill>
  );
}

export function ForecastVideoPlayer() {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold">Forecast Video (Remotion)</h3>
      <div className="overflow-hidden rounded-xl">
        <Player
          component={ForecastVideoScene}
          durationInFrames={120}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          acknowledgeRemotionLicense
          controls
          loop
          style={{ width: "100%", aspectRatio: "9 / 16" }}
        />
      </div>
    </section>
  );
}
