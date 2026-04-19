"use client";

import { FormEvent, useState } from "react";

export default function UploadPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
  const [message, setMessage] = useState("Upload a CSV with date and production columns.");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File | null;
    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    const payload = new FormData();
    payload.append("file", file);

    try {
      const response = await fetch(`${apiBase}/upload`, {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      setMessage(response.ok ? `Uploaded ${data.filename}: ${data.rows} rows` : data.detail ?? "Upload failed");
    } catch {
      setMessage("Backend not running. Start FastAPI to upload files.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Upload Production Data</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <input name="file" type="file" accept=".csv" className="block w-full text-sm" />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
          Upload
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
    </div>
  );
}
