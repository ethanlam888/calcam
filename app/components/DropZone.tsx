"use client";

import { useRef, useState } from "react";

interface Props {
  onImageSelected: (base64: string, mimeType: string, previewUrl: string) => void;
  disabled?: boolean;
}

export default function DropZone({ onImageSelected, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      onImageSelected(base64, file.type, dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center justify-center gap-3
        border-2 border-dashed rounded-2xl p-12 cursor-pointer
        transition-all duration-200 select-none
        ${dragging ? "border-emerald-400 bg-emerald-950/20" : "border-zinc-600 hover:border-zinc-400 bg-zinc-900/50"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
        disabled={disabled}
      />
      <div className="text-5xl">📸</div>
      <div className="text-center">
        <p className="text-zinc-200 font-medium">Drop a food photo here</p>
        <p className="text-zinc-500 text-sm mt-1">or click to browse — JPG, PNG, WEBP</p>
      </div>
    </div>
  );
}
