import React, { useEffect, useState } from 'react';
import departmentStyles from './admindepartmentstyles.module.css';
import { useAdminDepartments } from './hooks/admindepartemthooks.jsx';

const DepartmentsPage = () => {
  const {
    loading: hookLoading,
    fetchDepartments,
  } = useAdminDepartments();

  const [departments, setDepartments] = useState([]);

  /* =========================
     INITIAL DATA FETCH
  ========================= */
  useEffect(() => {
    const initData = async () => {
      console.log('🏢 Fetching departments...');
      const depts = await fetchDepartments();
      
      if (depts) {
        console.log('✅ Departments received:', depts);
        setDepartments(depts);
      }
    };

    initData();
  }, []);

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
  const getDeptInfo = (name) => {
    const icons = { 
      roads: '🛣️', 
      water: '💧', 
      power: '💡', 
      sanitation: '🗑️', 
      other: '❓' 
    };
    const displayNames = {
      roads: 'Roads & Infrastructure',
      water: 'Water Supply',
      power: 'Power & Electricity',
      sanitation: 'Sanitation & Garbage',
      other: 'Other Complaints',
    };
    return {
      icon: icons[name] || '🏢',
      displayName: displayNames[name] || name.charAt(0).toUpperCase() + name.slice(1),
    };
  };

  /* =========================
     RENDER DEPARTMENTS
  ========================= */
  const renderDepartments = () => {
    if (hookLoading) {
      return (
        <div className={departmentStyles.loadingSpinner}>
          <div className={departmentStyles.spinner}></div>
          <p>Loading departments...</p>
        </div>
      );
    }

    if (departments.length === 0) {
      return <div className={departmentStyles.noData}>No departments found</div>;
    }

    return (
      <div className={departmentStyles.departmentsGrid}>
        {departments.map(dept => {
          const { icon, displayName } = getDeptInfo(dept.name);
          const resolutionRate = dept.resolutionRate || 0;

          return (
            <div key={dept.name} className={departmentStyles.departmentCard}>
              <div className={departmentStyles.deptHeader}>
                <h3>
                  <span className={departmentStyles.deptIcon}>{icon}</span> {displayName}
                </h3>
                <span className={departmentStyles.deptBadge}>Active</span>
              </div>
              <div className={departmentStyles.deptMainStats}>
                <div className={departmentStyles.deptStat}>
                  <span className={departmentStyles.deptNumber}>{dept.total || 0}</span>
                  <span className={departmentStyles.deptLabel}>Total</span>
                </div>
                <div className={departmentStyles.deptStat}>
                  <span className={departmentStyles.deptNumber}>{dept.staff || 0}</span>
                  <span className={departmentStyles.deptLabel}>Staff</span>
                </div>
                <div className={departmentStyles.deptStat}>
                  <span className={departmentStyles.deptNumber}>{resolutionRate}%</span>
                  <span className={departmentStyles.deptLabel}>Resolution</span>
                </div>
              </div>
              <div className={departmentStyles.deptStatusBreakdown}>
                <div className={`${departmentStyles.statusItem} ${departmentStyles.statusPending}`}>
                  <span className={departmentStyles.statusNumber}>{dept.pending || 0}</span>
                  <span className={departmentStyles.statusLabel}>Pending</span>
                </div>
                <div className={`${departmentStyles.statusItem} ${departmentStyles.statusProgress}`}>
                  <span className={departmentStyles.statusNumber}>
                    {(dept.assigned || 0) + (dept.inProgress || 0)}
                  </span>
                  <span className={departmentStyles.statusLabel}>Active</span>
                </div>
                <div className={`${departmentStyles.statusItem} ${departmentStyles.statusResolved}`}>
                  <span className={departmentStyles.statusNumber}>{dept.resolved || 0}</span>
                  <span className={departmentStyles.statusLabel}>Resolved</span>
                </div>
              </div>
              <div className={departmentStyles.resolutionRate}>
                <div className={departmentStyles.rateHeader}>
                  <span className={departmentStyles.rateLabel}>Resolution Rate</span>
                  <span className={departmentStyles.rateValue}>{resolutionRate}%</span>
                </div>
                <div className={departmentStyles.progressBarContainer}>
                  <div 
                    className={departmentStyles.progressBar} 
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={departmentStyles.contentArea}>
      <div className={departmentStyles.pageHeader}>
        <h2>All Departments</h2>
        <div className={departmentStyles.pageActions}>
          <button 
            className={departmentStyles.btnSecondary} 
            onClick={async () => {
              const fresh = await fetchDepartments();
              setDepartments(fresh);
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      {renderDepartments()}
    </div>
  );
};

export default DepartmentsPage;