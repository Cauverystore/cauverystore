// ✅ src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setUserRole(data?.role ?? null);
      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading) return null;

  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // ✅ REQUIRED for nested routes to work
}
