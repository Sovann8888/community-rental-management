import { Outlet, NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Droplets, Wrench, History, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function initialsOf(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'R';
}

export function RenterLayout() {
  const { currentUser, community, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="sr-app">
      <aside className="sr-sidebar">
        <div className="sr-logo">
          <div className="sr-logo-mark">Smart-<span>Rent</span>House</div>
          <div className="sr-logo-sub">Renter Portal</div>
        </div>

        <nav className="sr-nav">
          <div className="sr-nav-section">My Home</div>
          <NavLink to="/renter" end className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><LayoutDashboard size={16} /></span> Dashboard
          </NavLink>

          <div className="sr-nav-section">Actions</div>
          <NavLink to="/renter/meter" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Droplets size={16} /></span> Submit Meter
          </NavLink>
          <NavLink to="/renter/maintenance" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><Wrench size={16} /></span> Request Fix
          </NavLink>
          <NavLink to="/renter/history" className={({isActive}) => `sr-nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon"><History size={16} /></span> My History
          </NavLink>
        </nav>

        <div className="sr-sidebar-bottom">
          <div className="sr-user-card" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Log out">
            <div className="sr-user-avatar" style={{ background: 'linear-gradient(135deg, var(--amber), var(--red))' }}>
              {initialsOf(currentUser?.name || 'Renter')}
            </div>
            <div style={{ flex: 1 }}>
              <div className="sr-user-name">{currentUser?.name || 'Renter'}</div>
              <div className="sr-user-role">
                {currentUser?.roomNumber ? `Room ${currentUser.roomNumber}` : community?.name || ''}
              </div>
            </div>
            <LogOut size={15} style={{ opacity: 0.6 }} />
          </div>
        </div>
      </aside>

      <main className="sr-main">
        <Outlet />
      </main>
    </div>
  );
}
