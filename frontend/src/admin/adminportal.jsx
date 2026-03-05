import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import DashboardPage from './adminhome';
import UsersPage from './adminusers';
import ComplaintsPage from './admincomplaints';
import DepartmentsPage from './admindepartments';
import StaffPage from './adminstaff';
import AllocationPage from './adminallocation';
import styles from './adminlayout.module.css';
import { useAdminPortal } from './hooks/adminportalhooks.jsx';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destructure logic from the hook
  const {
    loading: hookLoading,
    fetchProfile,
    logoutAdmin,
  } = useAdminPortal();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => window.innerWidth <= 768);
  const [user, setUser] = useState(null);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  /* =========================
     INITIAL DATA FETCH
  ========================= */
  useEffect(() => {
    const initData = async () => {
      // Fetch Admin Profile
      const userData = await fetchProfile();
      
      if (userData) {
        console.log('✅ Admin data fetched:', userData);
        setUser(userData);
      } else {
        console.log('❌ Admin not authenticated');
        navigate('/');
      }
    };

    initData();
  }, [navigate]);

  /* =========================
     HANDLE RESPONSIVE SIDEBAR
  ========================= */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* =========================
     UPDATE PAGE TITLE
  ========================= */
  useEffect(() => {
    const path = location.pathname;
    let title = 'Dashboard';
    
    if (path === '/admin/complaints') {
      title = 'Complaints';
    } else if (path === '/admin/users') {
      title = 'Users';
    } else if (path === '/admin/departments') {
      title = 'Departments';
    } else if (path === '/admin/staff') {
      title = 'Staff Management';
    } else if (path === '/admin/home' || path === '/admin/') {
      title = 'Dashboard';
    } else if (path === '/admin/allocate') {
      title = 'Complaint Allocation';
    }
    
    setPageTitle(title);
  }, [location.pathname]);

  /* =========================
     HANDLERS
  ========================= */
  const handleMenuToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    const result = await logoutAdmin();
    
    if (result.success) {
      console.log('✅ Logged out successfully');
      navigate('/');
    } else {
      console.error('❌ Logout failed:', result.error);
      navigate('/');
    }
  };

  /* =========================
     RENDERING
  ========================= */

  // Full Screen Loader
  if (hookLoading && !user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#888'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.pageContainer}>
      {/* === Sidebar === */}
      <div className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>CitiSolve</h2>
          <p className={styles.adminBadge}>ADMIN PORTAL</p>
        </div>
        <nav className={styles.sidebarNav}>
          <NavLink 
            to="/admin/home" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navText}>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/admin/allocate" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>🔒</span>
            <span className={styles.navText}>Complaint Allocation</span>
          </NavLink>
          <NavLink 
            to="/admin/complaints" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>📋</span>
            <span className={styles.navText}>Complaints</span>
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>👥</span>
            <span className={styles.navText}>Users</span>
          </NavLink>
          <NavLink 
            to="/admin/departments" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>🏢</span>
            <span className={styles.navText}>Departments</span>
          </NavLink>
          <NavLink 
            to="/admin/staff" 
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} 
            onClick={() => window.innerWidth <= 768 && setIsSidebarCollapsed(false)}
          >
            <span className={styles.navIcon}>👔</span>
            <span className={styles.navText}>Staff Management</span>
          </NavLink>
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className={styles.adminName}>{user?.name || 'Admin User'}</p>
              <p className={styles.adminRole}>{user?.email || 'admin@citisolve.com'}</p>
              <p className={styles.adminRole}>
                {user?.district && user?.state ? `${user.district}, ${user.state}` : 'Location: N/A'}
              </p>
              <p className={styles.adminRole}>ID: {user?.id || 'none'}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      
      {isSidebarCollapsed && window.innerWidth <= 768 && (
        <div className={styles.overlay} onClick={() => setIsSidebarCollapsed(true)} />
      )}
      
      {/* === Main Content Area === */}
      <div className={`${styles.mainContent} ${isSidebarCollapsed ? styles.expanded : ''}`}>
        {/* === Navbar === */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.menuToggle} onClick={handleMenuToggle}>
              ☰
            </button>
          </div>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <div className={styles.topbarRight}>
            <button className={styles.notificationBtn}>
              🔔<span className={styles.notificationBadge}>5</span>
            </button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/allocate" element={<AllocationPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminLayout;