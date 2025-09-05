import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAdminNotificationCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetchCount();
    const channel = supabase
      .channel("notification-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCount = async () => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);
    setCount(count || 0);
  };

  return count;
}

