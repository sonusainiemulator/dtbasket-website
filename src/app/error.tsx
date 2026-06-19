"use client";
import { useEffect } from "react";
import { TEXT } from "@/branding";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{TEXT.error.title}</h2>
      <p className="text-gray-500 mb-8">{TEXT.error.message}</p>
      <button onClick={reset} className="btn-primary">{TEXT.error.cta}</button>
    </div>
  );
}
