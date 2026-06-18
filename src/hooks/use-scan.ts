"use client";

import { useState, useCallback, useRef } from "react";
import { AIProvider } from "@/lib/ai/providers";
import { ScanResult } from "@/lib/types";

type ScanStatus = "idle" | "scanning" | "enhancing" | "done" | "error";

export function useScan() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (progressRef.current) clearInterval(progressRef.current);
          return prev;
        }
        return prev + Math.random() * 15 + 2;
      });
    }, 400);
  }, []);

  const finishProgress = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
    setProgress(100);
  }, []);

  const scanWebsite = useCallback(async (url: string, language: string) => {
    setError(null);
    setScan(null);
    setReport(null);
    setStatus("scanning");
    startProgress();

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), language }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Scan failed");

      finishProgress();
      setScan(data.scan);
      setReport(data.report);
      setStatus("done");
      return data;
    } catch (e) {
      finishProgress();
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
      throw e;
    }
  }, [startProgress, finishProgress]);

  const enhanceWithAI = useCallback(async (url: string, provider: AIProvider, language: string) => {
    setError(null);
    setStatus("enhancing");
    startProgress();

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, provider, language }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Enhancement failed");

      finishProgress();
      setScan(data.scan);
      setReport(data.report);
      setStatus("done");
      return data;
    } catch (e) {
      finishProgress();
      setError(e instanceof Error ? e.message : "AI enhancement failed");
      setStatus("error");
      throw e;
    }
  }, [startProgress, finishProgress]);

  const downloadReport = useCallback(() => {
    if (!report || !scan) return;
    const blob = new Blob([report], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `rankflow-report-${new URL(scan.url).hostname}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [report, scan]);

  const cleanup = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  return {
    status,
    scan,
    report,
    error,
    progress,
    scanWebsite,
    enhanceWithAI,
    downloadReport,
    cleanup,
  };
}