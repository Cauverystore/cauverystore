import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof gtag === "function") {
      gtag("config", "G-3KRHXGB7JV", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}
