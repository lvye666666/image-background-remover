"use client";

import { useState, useRef, useCallback } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ProcessingState = "idle" | "uploading" | "processing" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setErrorMessage(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("仅支持 JPG、PNG、WebP 格式的图片，请重新选择。");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("图片大小不能超过 10MB，请压缩后重试。");
      return;
    }

    // Preview original
    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);
    setResultImage(null);
    setState("uploading");

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      setState("processing");

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `处理失败 (${res.status})`);
      }

      const data = await res.json();
      setResultImage(data.result);
      setState("done");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "未知错误，请重试。";
      setErrorMessage(message);
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDownload = useCallback(() => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = "bgremover-result.png";
    a.click();
  }, [resultImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setResultImage(null);
    setErrorMessage(null);
    setState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            bgremover
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            拖拽即用的在线图片背景移除工具 · 无需注册 · 秒级出图
          </p>
        </div>

        {/* Upload Area */}
        {!originalImage && state === "idle" && (
          <div
            className={`
              w-full border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
              ${isDragOver
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105"
                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900"
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="text-5xl">🖼️</div>
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                  拖拽图片到此处，或点击上传
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  支持 JPG、PNG、WebP，最大 10MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleChange}
            />
          </div>
        )}

        {/* Preview Area */}
        {(originalImage || state !== "idle") && (
          <div className="w-full flex flex-col items-center gap-6">

            {/* Preview Cards */}
            <div className="flex gap-6 w-full justify-center">
              {/* Original */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">原图</p>
                <div className="relative border rounded-xl overflow-hidden shadow-sm bg-white">
                  <img
                    src={originalImage || ""}
                    alt="原图"
                    className="max-w-64 max-h-64 object-contain"
                  />
                </div>
              </div>

              {/* Result */}
              {resultImage && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">处理后</p>
                  <div className="relative border rounded-xl overflow-hidden shadow-sm bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultImage}
                      alt="处理后"
                      className="max-w-64 max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Processing Indicator */}
            {state === "uploading" && (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <div className="text-3xl spinner">⏳</div>
                <p className="text-sm">正在上传...</p>
              </div>
            )}

            {state === "processing" && (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <div className="text-3xl spinner">⚙️</div>
                <p className="text-sm">正在移除背景...</p>
              </div>
            )}

            {/* Error */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-center">
                <p className="text-red-600 dark:text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {state === "done" && (
                <>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    ↓ 下载透明 PNG
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    处理下一张
                  </button>
                </>
              )}

              {(state === "error" || state === "idle") && originalImage && (
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  重新上传
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <p className="text-xs text-gray-400 mt-4">
          图片全程内存处理，不存储、不留痕 🔒
        </p>
      </div>
    </main>
  );
}
