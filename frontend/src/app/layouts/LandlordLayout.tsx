import { Outlet, NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Building2, Calculator, Receipt, CreditCard, Wrench, LogOut } from "lucide-react";
import { LandlordProvider } from "../context/LandlordContext";
import { useAuth } from "../context/AuthContext";

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'L';
}

export function LandlordLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <LandlordProvider>
      <div className="sr-app">
      <aside className="sr-sidebar">
        <div className="sr-logo">
          <div className="sr-logo-mark">Smart-<span>Rent</span>House</div>
          <div className="sr-logo-sub">Property Management</div>
        </div>

        <nav className="sr-nav">
          <div className="sr-nav-section">Main</div>
          <NavLink to="/landlord" end className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><LayoutDashboard size={16} /></span> Dashboard
          </NavLink>
          <NavLink to="/landlord/rooms" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Building2 size={16} /></span> Rooms &amp; Tenants
          </NavLink>

          <div className="sr-nav-section">Billing</div>
          <NavLink to="/landlord/meter" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Calculator size={16} /></span> Meter Calculator
          </NavLink>
          <NavLink to="/landlord/invoice" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Receipt size={16} /></span> Invoice Creator
          </NavLink>
          <NavLink to="/landlord/payment" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><CreditCard size={16} /></span> Payment Checker
          </NavLink>

          <div className="sr-nav-section">Community</div>
          <NavLink to="/landlord/maintenance" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Wrench size={16} /></span> Maintenance
          </NavLink>
        </nav>

        <div className="sr-sidebar-bottom">
          <div className="sr-user-card" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Log out">
            <div className="sr-user-avatar">{initialsOf(currentUser?.name || 'Landlord')}</div>
            <div style={{ flex: 1 }}>
              <div className="sr-user-name">{currentUser?.name || 'Landlord'}</div>
              <div className="sr-user-role">{currentUser?.phone}</div>
            </div>
            <LogOut size={15} style={{ opacity: 0.6 }} />
          </div>
        </div>
      </aside>

      <main className="sr-main">
        <Outlet />
      </main>
    </div>
    </LandlordProvider>
  );
}
