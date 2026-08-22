"use client";
import { useEffect } from "react";

// MediaPipe / TFLite logs "INFO: ..." to console.error — Next.js dev mode picks
// this up as an "Issue". This component suppresses those false-positive messages.
export function ConsolePatch() {
    useEffect(() => {
        const original = console.error.bind(console);
        console.error = (...args: unknown[]) => {
            const msg = typeof args[0] === "string" ? args[0] : "";
            // Suppress TFLite INFO logs that MediaPipe routes to console.error
            if (msg.startsWith("INFO:") || msg.includes("TensorFlow Lite")) return;
            original(...args);
        };
        return () => {
            console.error = original;
        };
    }, []);
    return null;
}
