import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import styles from './adminhomestyle.module.css';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from './hooks/adminhomehooks.jsx';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Destructure logic from the hook
  const {
    loading: hookLoading,
    fetchProfile,
    fetchDashboardStats,
    fetchDepartmentWorkload,
  } = useAdminDashboard();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [workloadData, setWorkloadData] = useState([]);
  
  const chartRef = useRef(null);

  /* =========================
     INITIAL DATA FETCH
  ========================= */
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch Admin Profile
      const userData = await fetchProfile();
      
      if (userData) {
        console.log('✅ Admin data fetched:', userData);
        setUser(userData);

        // 2. Fetch Dashboard Stats
        console.log('📊 Fetching dashboard stats...');
        const statsData = await fetchDashboardStats();
        
        if (statsData) {
          console.log('✅ Dashboard stats received:', statsData);
          setStats(statsData);
        }

        // 3. Fetch Department Workload
        console.log('📈 Fetching department workload...');
        const workload = await fetchDepartmentWorkload();
        
        if (workload) {
          console.log('✅ Department workload received:', workload);
          setWorkloadData(workload);
        }
      } else {
        console.log('❌ Admin not authenticated');
        navigate('/');
      }
    };

    initData();
  }, [navigate]);

  /* =========================
     CHART INITIALIZATION
  ========================= */
  useEffect(() => {
    if (workloadData.length > 0) {
      const chartCanvas = document.getElementById('departmentChart');
      if (chartCanvas) {
        const existingChart = Chart.getChart(chartCanvas);
        if (existingChart) existingChart.destroy();

        // Calculate active complaints (total - resolved)
        const chartData = workloadData.map(dept => ({
          name: dept.department.charAt(0).toUpperCase() + dept.department.slice(1),
          active: (dept.total || 0) - (dept.resolved || 0),
          total: dept.total || 0,
          resolved: dept.resolved || 0,
        }));

        const labels = chartData.map(d => d.name);
        const activeComplaints = chartData.map(d => d.active);

        chartRef.current = new Chart(chartCanvas, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'Active Complaints',
              data: activeComplaints,
              backgroundColor: ['#666', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
              borderColor: ['#666', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
              borderWidth: 1,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const dept = chartData[context.dataIndex];
                    return [
                      `Active: ${dept.active}`,
                      `Total: ${dept.total}`,
                      `Resolved: ${dept.resolved}`
                    ];
                  }
                }
              }
            },
            scales: {
              y: { 
                beginAtZero: true, 
                ticks: { color: '#888' }, 
                grid: { color: '#2a2a2a' } 
              },
              x: { 
                ticks: { color: '#888' }, 
                grid: { display: false } 
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [workloadData]);

  /* =========================
     RENDER STATS CARDS
  ========================= */
  const renderStats = () => {
    if (!stats) {
      return (
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p style={{ color: '#888' }}>Loading stats...</p>
        </div>
      );
    }

    const statItems = [
      { 
        id: 'totalComplaints', 
        icon: '📋', 
        value: stats.totalcomplaints || 0, 
        label: 'Total Complaints', 
        className: styles.statPrimary 
      },
      { 
        id: 'pendingComplaints', 
        icon: '⏳', 
        value: stats.pending || 0, 
        label: 'Pending', 
        className: styles.statWarning 
      },
      { 
        id: 'assignedComplaints', 
        icon: '📌', 
        value: stats.assigned || 0, 
        label: 'Assigned', 
        className: styles.statInfo 
      },
      { 
        id: 'progressComplaints', 
        icon: '🔄', 
        value: stats.inprogress || 0, 
        label: 'In Progress', 
        className: styles.statInfo 
      },
      { 
        id: 'resolvedComplaints', 
        icon: '✅', 
        value: stats.resolved || 0, 
        label: 'Resolved', 
        className: styles.statSuccess 
      },
      { 
        id: 'rejectedComplaints', 
        icon: '❌', 
        value: stats.rejected || 0, 
        label: 'Rejected', 
        className: styles.statDanger 
      },
      { 
        id: 'staffCount', 
        icon: '👔', 
        value: stats.staff || 0, 
        label: 'Staff Members', 
        className: styles.statStaff 
      },
      { 
        id: 'departmentCount', 
        icon: '🏢', 
        value: stats.totaldepartments || 0, 
        label: 'Departments', 
        className: styles.statDepartments 
      },
    ];

    return (
      <div className={styles.statsGrid}>
        {statItems.map(item => (
          <div key={item.id} className={`${styles.statCard} ${item.className}`}>
            <div className={styles.statIcon}>{item.icon}</div>
            <div className={styles.statInfo}>
              <h3>{item.value}</h3>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* =========================
     RENDERING
  ========================= */

  // Full Screen Loader
  if (hookLoading && !user) {
    return (
      <div className={styles.fullLoading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.contentArea}>
      <a className={styles.allocationbtn} onClick={() => navigate("/admin/allocate")}>
        🔒 Allocate Complaints
      </a>
      {renderStats()}
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardSection}>
          <div className={styles.sectionHeader}>
            <h2>Department Workload</h2>
          </div>
          <div className={styles.chartContainer}>
            {hookLoading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p style={{ color: '#888' }}>Loading chart...</p>
              </div>
            ) : (
              <canvas id="departmentChart"></canvas>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;