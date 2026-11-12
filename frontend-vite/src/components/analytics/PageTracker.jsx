import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_URL } from "../../lib/api";

const KEY = "vc-tech-analytics-visitor";

function getVisitorId() {
  let id = sessionStorage.getItem(KEY);

  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }

  return id;
}

export default function PageTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (
      pathname.startsWith("/admin") ||
      import.meta.env.DEV
    ) return;

    const visitorId = getVisitorId();

    fetch(`${API_URL}/analytics/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, path: pathname }),
      keepalive: true
    }).catch(() => {
      // Analytics must never interrupt storefront navigation.
    });
  }, [pathname]);

  return null;
}
