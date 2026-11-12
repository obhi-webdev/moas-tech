import { useEffect } from "react";
import { getSettings } from "../lib/api";

const DEFAULT_TITLE = "VC Tech | Gadgets & Electronics";
const DEFAULT_ICON = "/favicon.svg";

export default function WebsiteMetadata() {
  useEffect(() => {
    let active = true;

    async function applyBranding() {
      try {
        const response = await getSettings();
        if (!active) return;

        const settings = response.settings || response;
        const title = settings.siteTitle?.trim() || DEFAULT_TITLE;
        const favicon = settings.favicon || DEFAULT_ICON;

        document.title = title;

        let link = document.querySelector('link[rel="icon"]');

        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }

        link.href = favicon;
        link.type = favicon.endsWith(".svg")
          ? "image/svg+xml"
          : favicon.split("?")[0].endsWith(".png")
            ? "image/png"
            : favicon.split("?")[0].endsWith(".webp")
              ? "image/webp"
              : "image/jpeg";
      } catch {
        // Keep static metadata when settings API is unavailable.
      }
    }

    applyBranding();

    return () => {
      active = false;
    };
  }, []);

  return null;
}
