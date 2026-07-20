import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/db";

export function RequireRole({ role, children }: { role: Role; children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/" replace />;
  if (currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'landlord' ? '/landlord' : '/renter'} replace />;
  }
  return <>{children}</>;
}
