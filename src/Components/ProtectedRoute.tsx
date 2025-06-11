import { useEffect, useState } from "react";
import { useAuth } from "@/Components/AuthProvider";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // optional: e.g., ["admin", "merchant"]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .single();

        if (error || !profile || profile.status !== "active") {
          navigate("/not-authorized");
          return;
        }

        if (!allowedRoles.includes(profile.role)) {
          navigate("/not-authorized");
          return;
        }
      }

      setChecking(false);
    };

    verifyAccess();
  }, [user, allowedRoles, navigate]);

  if (checking) return <div className="p-4 text-center">Checking permissions...</div>;

  return <>{children}</>;
}
