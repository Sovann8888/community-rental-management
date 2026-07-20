import { Outlet } from "react-router";

export function AuthLayout() {
  return (
    <div className="sr-app" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  );
}
