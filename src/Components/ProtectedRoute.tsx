import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/SupabaseClient";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const userId = session.user.id;
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error || !profile) {
        setAuthorized(false);
      } else {
        setAuthorized(allowedRoles.includes(profile.role));
      }

      setLoading(false);
    };

    checkAccess();
  }, [allowedRoles]);

  if (loading) return <div className="text-center p-8">Checking access...</div>;

  return authorized ? <>{children}</> : <Navigate to="/not-authorized" />;
};

export default ProtectedRoute;
