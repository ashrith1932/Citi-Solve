import React, { useEffect, useState } from 'react';
import styles from './staffhome.module.css';
import { useNavigate } from 'react-router-dom';
import { useStaffPortal } from './hooks/staffportalhooks.jsx';

const StaffPortal = () => {
  const navigate = useNavigate();
  
  // Destructure logic from the hook
  const { 
    loading: hookLoading, 
    fetchProfile, 
    fetchDashboardStats, 
    logoutStaff 
  } = useStaffPortal();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Dashboard stats state
  const [complaintstats, setComplaintstats] = useState({
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    active: 0,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setShowOverlay(!showOverlay);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    await logoutStaff();
    navigate('/');
  };

  /* =========================
     INITIAL DATA FETCH
  ========================= */
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch Staff Profile
      const userData = await fetchProfile();
      
      if (userData) {
        console.log('✅ Staff data fetched:', userData);
        setUser(userData);

        // 2. Fetch Dashboard Stats
        console.log('📊 Fetching dashboard stats...');
        const statsData = await fetchDashboardStats();
        
        if (statsData) {
          console.log('✅ Dashboard stats received:', statsData);
          setComplaintstats(statsData);
        }
      } else {
        console.log('❌ Staff not authenticated');
        navigate('/');
      }
    };

    initData();
  }, [navigate]); // Runs once on mount

  /* =========================
     HANDLE CLICKS OUTSIDE
  ========================= */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        isProfileDropdownOpen &&
        !event.target.closest(`.${styles.profileDropdown}`) &&
        !event.target.closest(`.${styles.profileSymbol}`)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        isSidebarOpen &&
        !event.target.closest(`.${styles.sidebar}`) &&
        !event.target.closest(`.${styles.menuIcon}`)
      ) {
        setIsSidebarOpen(false);
        setShowOverlay(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen, isSidebarOpen]);

  /* =========================
     RENDERING
  ========================= */

  // Loading Skeleton Component
  const Loader = () => (
    <div className={styles.statLoader}>
      <div className={styles.loadingSpinner}></div>
    </div>
  );

  // Full Screen Loader: Only show if we are loading AND we don't have a user yet
  if (hookLoading && !user) {
    return <div className={styles.fullLoading}>Loading...</div>;
  }

  // Safety check: If not loading but no user, return null (effect will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.mainContainer}>
      {showOverlay && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}
      
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`} id="sidebar">
        <h2>CitiSolve Staff</h2>
        <a onClick={() => navigate('/staff/home')} className={`${styles.navLink} ${styles.active}`}>
          🏠 Home
        </a>
        <a onClick={() => navigate('/staff/departmentcomplaints')} className={styles.navLink}>
          📋 Department Complaints
        </a>
        <a onClick={() => navigate('/staff/search')} className={styles.navLink}>
          🔍 Advanced Search
        </a>
        <a onClick={() => navigate('/staff/faq')} className={styles.navLink}>
          ❓ FAQ
        </a>
        <a onClick={() => navigate('/staff/support')} className={styles.navLink}>
          💬 Support
        </a>
        <a onClick={() => navigate('/staff/userguide')} className={styles.navLink}>
          📖 User Guide
        </a>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.topnav}>
          <div className={styles.menuIcon} id="menuToggle" onClick={toggleSidebar}>
            ☰
          </div>
          <div className={styles.breadcrumb}>
            <span>Home</span>
          </div>
          <div className={styles.profileSymbol} id="profileSymbol" onClick={toggleProfileDropdown}>
            {user.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div
            className={`${styles.profileDropdown} ${isProfileDropdownOpen ? styles.open : ''}`}
            id="profileDropdown"
          >
            <p>
              <strong>Name: </strong>
              <span id="userName">{user.name}</span>
            </p>
            <p>
              <strong>Email: </strong>
              <span id="userEmail">{user.email}</span>
            </p>
            <p>
              <strong>Department: </strong>
              <span id="userDept">{user.department}</span>
            </p>
            <p>
              <strong>Location: </strong>
              <span id="userLocation">{user.district}, {user.state}</span>
            </p>
            <p>
              <strong>Role: </strong>
              <span id="username">{user.role}</span>
            </p>
            <p style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
              <a href="#" style={{ color: '#4a90e2', textDecoration: 'none' }}>
                Settings
              </a>{' '}
              |{' '}
              <a
                onClick={handleLogout}
                style={{ color: '#4a90e2', textDecoration: 'none', cursor: 'pointer' }}
              >
                Logout
              </a>
            </p>
          </div>
        </div>

        <div className={styles.content} id="home-page">
          <div className={styles.welcomeSection}>
            <h1 id="welcomeText">Welcome {user.name ? user.name.split(' ')[0] : ''} 👋</h1>
            <p>Manage and resolve citizen complaints efficiently</p>
          </div>

          <div className={styles.mainGrid}>
            <div className={styles.leftPanel}>
              <div className={styles.quickLinks}>
                <a onClick={() => navigate('/staff/departmentcomplaints')} className={styles.card}>
                  📋 Department Complaints
                </a>
                <a onClick={() => navigate('/staff/search')} className={styles.card}>
                  🔍 Advanced Search
                </a>
                <a onClick={() => navigate('/staff/userguide')} className={styles.card}>
                  📖 User Guide
                </a>
              </div>

              {/* DASHBOARD CARDS: Use hookLoading for skeleton state */}
              <div className={styles.dashboardCards}>
                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="totalCount">{complaintstats.total}</span>
                  )}
                  <span className={styles.statLabel}>Total Complaints</span>
                  <div className={styles.statHoverLine}></div>
                </button>
                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="totalCount">{complaintstats.assigned}</span>
                  )}
                  <span className={styles.statLabel}>Assigned</span>
                  <div className={styles.statHoverLine}></div>
                </button>

                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="progressCount">{complaintstats.inProgress}</span>
                  )}
                  <span className={styles.statLabel}>In Progress</span>
                  <div className={styles.statHoverLine}></div>
                </button>

                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="resolvedCount">{complaintstats.resolved}</span>
                  )}
                  <span className={styles.statLabel}>Resolved</span>
                  <div className={styles.statHoverLine}></div>
                </button>

                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="rejectedCount">{complaintstats.rejected}</span>
                  )}
                  <span className={styles.statLabel}>Rejected</span>
                  <div className={styles.statHoverLine}></div>
                </button>

                <button className={`${styles.stat} ${hookLoading ? styles.loading : ''}`}>
                  {hookLoading ? (
                    <Loader />
                  ) : (
                    <span className={styles.statNumber} id="activeCount">{complaintstats.active}</span>
                  )}
                  <span className={styles.statLabel}>Active</span>
                  <div className={styles.statHoverLine}></div>
                </button>
              </div>
            </div>

            <div className={styles.rightPanel}>
              <div className={styles.infoCard}>
                <h3>📢 Recent Updates</h3>
                <p id="recentUpdates">No Recent updates</p>
              </div>

              <div className={styles.infoCard}>
                <h3>👤 Your Info</h3>
                <p>
                  <strong>ID: </strong>
                  <span id="infoId">{user._id}</span>
                </p>
                <p>
                  <strong>Name: </strong>
                  <span id="infoName">{user.name}</span>
                </p>
                <p>
                  <strong>Department: </strong>
                  <span id="infoDept">{user.department}</span>
                </p>
                <p>
                  <strong>Location: </strong>
                  <span id="infoLocation">{user.district}, {user.state}</span>
                </p>
                <p>
                  <strong>Email: </strong>
                  <span id="infoEmail">{user.email}</span>
                </p>
                <p>
                  <strong>Role: </strong>
                  <span id="infoRole">{user.role}</span>
                </p>
              </div>

              {/* Display Staff Stats if available */}
              {user.stats && (
                <div className={styles.infoCard}>
                  <h3>📊 Performance Stats</h3>
                  <p>
                    <strong>Assigned: </strong>
                    <span>{user.stats.assigned}</span>
                  </p>
                  <p>
                    <strong>In Progress: </strong>
                    <span>{user.stats.inProgress}</span>
                  </p>
                  <p>
                    <strong>Resolved: </strong>
                    <span>{user.stats.resolved}</span>
                  </p>
                  <p>
                    <strong>Rejected: </strong>
                    <span>{user.stats.rejected}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer>
          Powered by CitiSolve Staff Portal |{' '}
          <a 
            onClick={() => navigate('/staff/support')}
            style={{ color: 'white', textDecoration: 'none', cursor: 'pointer' }}
          >
            Contact Administrator
          </a>
        </footer>
      </div>
    </div>
  );
};

export default StaffPortal;