"use client";

import { useState } from "react";
import DropZone from "./components/DropZone";
import ResultCard from "./components/ResultCard";

type Status = "idle" | "loading" | "success" | "error";

interface AnalysisResult {
  totalCalories: number;
  confidence: "high" | "medium" | "low";
  items: { name: string; quantity: string; calories: number }[];
  notes?: string;
}

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleImageSelected(base64: string, mimeType: string, preview: string) {
    setPreviewUrl(preview);
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  function reset() {
    setPreviewUrl(null);
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">CalCam</h1>
          <p className="text-zinc-400 mt-2 text-sm">Snap a photo of your meal and get an instant calorie estimate</p>
        </div>

        <div className="bg-zinc-900 rounded-2xl ring-1 ring-white/10 p-6 flex flex-col gap-6">
          {status === "idle" && (
            <DropZone onImageSelected={handleImageSelected} />
          )}

          {(status === "loading" || status === "success" || status === "error") && previewUrl && (
            <div className="rounded-xl overflow-hidden ring-1 ring-white/10 max-h-64 flex items-center justify-center bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Food preview" className="max-h-64 w-full object-contain" />
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Analyzing your meal...</p>
            </div>
          )}

          {status === "success" && result && (
            <ResultCard result={result} onReset={reset} />
          )}

          {status === "error" && (
            <div className="flex flex-col gap-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-zinc-600 text-xs">
          Calorie estimates are approximate and for informational purposes only.
        </p>
      </div>
    </main>
  );
}
