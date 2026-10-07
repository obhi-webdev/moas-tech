"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

interface SiteLogoProps {
  location?: "header" | "footer";
}

export default function SiteLogo({
  location = "header",
}: SiteLogoProps) {
  const [logo, setLogo] = useState("");
  const [siteName, setSiteName] = useState("VC Tech");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(`${API_URL}/settings`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!active) return;

        setLogo(data?.logo || "");
        setSiteName(data?.siteName || "VC Tech");
      } catch (error) {
        console.error("Site logo loading error:", error);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  if (logo) {
    return (
      <img
        src={logo}
        alt={`${siteName} Logo`}
        className={
          location === "footer"
            ? "h-auto max-h-14 w-auto max-w-[190px] rounded-[10px] object-contain"
            : "h-12 w-auto max-w-[180px] rounded-[10px] object-contain md:h-14 md:max-w-[200px]"
        }
      />
    );
  }

  return (
    <div>
      <div
        className={
          location === "footer"
            ? "text-2xl font-black tracking-tight"
            : "text-2xl font-black tracking-tight md:text-3xl"
        }
      >
        <span className="text-orange-500">VC</span>
        <span className="text-white"> TECH</span>
      </div>

      {location === "header" && (
        <div className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400 sm:block">
          Technology Store
        </div>
      )}
    </div>
  );
}
