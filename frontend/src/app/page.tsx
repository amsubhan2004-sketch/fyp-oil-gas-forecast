"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Chatbot } from "@/components/chatbot";
import { ForecastChart } from "@/components/forecast-chart";
import { ForecastVideoPlayer } from "@/components/forecast-video";
import { ThemeToggle } from "@/components/theme-toggle";
import { Well3D } from "@/components/well-3d";
import { modelMetrics, productionSeries } from "@/data/sample-data";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oil & Gas Production Forecasting</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            ML + Decline Curve Analysis + 3D visualization + Remotion video previews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/upload" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Upload Data
          </Link>
          <ThemeToggle />
        </div>
      </motion.header>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid gap-6 lg:grid-cols-2">
        <ForecastChart data={productionSeries} />
        <Well3D />
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold">Model Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500">
                  <th className="pb-2">Model</th>
                  <th className="pb-2">RMSE</th>
                  <th className="pb-2">MAE</th>
                  <th className="pb-2">R²</th>
                </tr>
              </thead>
              <tbody>
                {modelMetrics.map((item) => (
                  <tr key={item.model} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="py-2">{item.model}</td>
                    <td className="py-2">{item.rmse}</td>
                    <td className="py-2">{item.mae}</td>
                    <td className="py-2">{item.r2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Chatbot />
      </motion.section>

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <ForecastVideoPlayer />
      </motion.section>
    </div>
  );
}
