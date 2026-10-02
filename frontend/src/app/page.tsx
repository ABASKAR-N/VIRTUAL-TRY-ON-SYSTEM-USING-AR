"use client";

import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Check,
  Glasses,
  PersonStanding,
  ShoppingBag,
  Shirt,
  Star,
  Zap,
} from "lucide-react";
import { useMediaPipe } from "@/hooks/useMediaPipe";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Tab = "eyewear" | "tops" | "bottoms";

type Product = {
  id: string;
  name: string;
  price: number;
  accent: string;
  tag: string;
};

const CATALOG: Record<Tab, Product[]> = {
  eyewear: [
    { id: "e1", name: "Classic Aviator", price: 129, accent: "#f5c842", tag: "Pilot" },
    { id: "e2", name: "Wayfarer", price: 99, accent: "#9ca3af", tag: "Classic" },
    { id: "e3", name: "Round John", price: 119, accent: "#f97316", tag: "Vintage" },
    { id: "e4", name: "Cat-Eye", price: 145, accent: "#e879f9", tag: "Glam" },
  ],
  tops: [
    { id: "t1", name: "Urban Hoodie", price: 85, accent: "#38bdf8", tag: "Casual" },
    { id: "t2", name: "Blazer Elite", price: 195, accent: "#f59e0b", tag: "Formal" },
    { id: "t3", name: "Graphic Tee", price: 45, accent: "#a855f7", tag: "Street" },
    { id: "t4", name: "Leather Jacket", price: 285, accent: "#ef4444", tag: "Edge" },
  ],
  bottoms: [
    { id: "b1", name: "Slim Jeans", price: 95, accent: "#60a5fa", tag: "Casual" },
    { id: "b2", name: "Cargo Pants", price: 85, accent: "#4ade80", tag: "Street" },
    { id: "b3", name: "Chinos", price: 79, accent: "#d97706", tag: "Smart" },
    { id: "b4", name: "Mini Skirt", price: 55, accent: "#c084fc", tag: "Glam" },
  ],
};

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const [activeTab, setActiveTab] = useState<Tab>("eyewear");
  const [selectedId, setSelectedId] = useState<string>(CATALOG.eyewear[0]?.id ?? "");
  const [backendReady, setBackendReady] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Checking backend...");
  const { isLoaded, loadingStatus } = useMediaPipe();

  const products = CATALOG[activeTab];
  const selected = products.find((item) => item.id === selectedId) ?? products[0];

  useEffect(() => {
    setSelectedId(products[0]?.id ?? "");
  }, [activeTab, products]);

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data?.status === "healthy") {
          setBackendReady(true);
          setBackendStatus("Backend online");
        } else {
          setBackendReady(false);
          setBackendStatus("Backend unavailable");
        }
      } catch (error) {
        if (!isMounted) return;
        setBackendReady(false);
        setBackendStatus("Backend offline");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const systemReady = isLoaded && backendReady;
  const accentColor = selected?.accent ?? "#a855f7";

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/png"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />

      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-fuchsia-500 to-cyan-400 opacity-80 blur-sm" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-600 to-cyan-500 shadow-lg">
              <Zap size={16} className="text-white" />
            </div>
          </div>
          <div className="leading-none">
            <p className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-base font-black tracking-tight text-transparent">
              Aura Try-On
            </p>
            <p className="text-[9px] uppercase tracking-widest text-white/50">AI Fitting Room</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold backdrop-blur-xl ${
              systemReady
                ? "border-emerald-400/30 bg-black/40 text-emerald-400"
                : "border-amber-400/30 bg-black/40 text-amber-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                systemReady ? "animate-pulse bg-emerald-400" : "animate-bounce bg-amber-400"
              }`}
            />
            {systemReady ? "System Ready" : backendReady ? loadingStatus : backendStatus}
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-xl transition hover:bg-white/20"
            aria-label="Capture snapshot"
          >
            <Camera size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[72px] z-30 flex justify-center gap-2 px-4">
        {(["eyewear", "tops", "bottoms"] as Tab[]).map((tab) => {
          const icons = {
            eyewear: <Glasses size={13} />,
            tops: <Shirt size={13} />,
            bottoms: <PersonStanding size={13} />,
          };

          const labels = {
            eyewear: "Eyewear",
            tops: "Top Body",
            bottoms: "Bottoms",
          };

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                activeTab === tab
                  ? "scale-[1.03] border-transparent bg-white text-black shadow-lg"
                  : "border-white/20 bg-black/30 text-white hover:bg-white/10"
              }`}
            >
              {icons[tab]}
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {!backendReady && (
        <div className="absolute inset-x-0 top-[160px] z-30 flex justify-center">
          <div className="rounded-full border border-amber-400/40 bg-black/50 px-4 py-2 text-[11px] text-amber-300">
            Backend not reachable at {API_URL}. Start the FastAPI server first.
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 px-4 pb-6 pt-2">
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {products.map((item) => {
            const isSelected = item.id === selected?.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-[72px] flex-shrink-0 rounded-2xl p-1 text-center transition-all active:scale-90 ${
                  isSelected ? "scale-105" : ""
                }`}
              >
                <div
                  className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-2xl border-2 backdrop-blur-xl transition-all ${
                    isSelected ? "border-white bg-white/20" : "border-white/20 bg-black/30"
                  }`}
                  style={isSelected ? { boxShadow: `0 0 20px ${item.accent}66` } : undefined}
                >
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: `radial-gradient(circle, ${item.accent}33 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative z-10">
                    {activeTab === "eyewear" && <Glasses size={26} style={{ color: item.accent }} />}
                    {activeTab === "tops" && <Shirt size={26} style={{ color: item.accent }} />}
                    {activeTab === "bottoms" && <PersonStanding size={26} style={{ color: item.accent }} />}
                  </div>
                  {isSelected && (
                    <div className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                      <Check size={9} className="text-black" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className={`mt-1 text-[9px] font-semibold ${isSelected ? "text-white" : "text-white/50"}`}>
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            className="rounded-3xl border border-white/10 bg-black/50 p-4 backdrop-blur-2xl"
            style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ color: accentColor, background: `${accentColor}22` }}
                  >
                    {selected.tag}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] text-amber-400">
                    <Star size={9} fill="#f59e0b" /> 4.9
                  </div>
                </div>
                <h2 className="text-lg font-black leading-tight text-white">{selected.name}</h2>
                <p className="mt-0.5 text-xs text-white/40">
                  {activeTab === "eyewear" ? "Eyewear" : activeTab === "tops" ? "Top Wear" : "Bottom Wear"} · Free Delivery
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-2xl font-black text-white">${selected.price}</p>
                <p className="text-[10px] text-white/30 line-through">${Math.round(selected.price * 1.3)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-white/40">Color</span>
              {[accentColor, `${accentColor}aa`, "#ffffff33", "#ffffff15"].map((c, i) => (
                <div
                  key={i}
                  className={`h-5 w-5 rounded-full border-2 ${i === 0 ? "scale-110 border-white" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-gray-100 active:scale-95">
                <span className="flex items-center justify-center gap-2">
                  <Glasses size={15} /> Try On
                </span>
              </button>

              <button
                className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-black transition active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                  boxShadow: `0 4px 20px ${accentColor}44`,
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag size={15} className="text-black/70" /> Shop Now
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
