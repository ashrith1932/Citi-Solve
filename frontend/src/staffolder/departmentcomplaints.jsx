import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './departmentcomplaintsstyle.module.css';
import { useDepartmentComplaints } from './hooks/staffdepartmenthooks.jsx';

const DepartmentComplaints = () => {
  const navigate = useNavigate();
  
  // Destructure logic from the hook
  const {
    loading: hookLoading,
    fetchProfile,
    fetchAssignedComplaints,
    fetchComplaintById,
    updateComplaintStatus,
    logoutStaff,
  } = useDepartmentComplaints();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(false);

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

        // 2. Fetch Assigned Complaints
        console.log('📋 Fetching assigned complaints...');
        const complaintsData = await fetchAssignedComplaints({
          status: 'all',
          sortBy: 'newest',
          limit: 50,
        });
        
        if (complaintsData) {
          console.log('✅ Complaints received:', complaintsData);
          // Transform backend data to match component expectations
          const transformedComplaints = complaintsData.complaints.map(c => ({
            id: c._id,
            title: c.title,
            description: c.description,
            category: c.category,
            location: c.landmark || c.location || 'N/A',
            priority: c.priority || 'medium',
            status: c.status === 'in-progress' ? 'progress' : c.status,
            date: new Date(c.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            citizen: c.citizen,
            assignedBy: c.assignedBy,
            comment: c.comment,
            resolutionNote: c.resolutionNote,
            resolvedAt: c.resolvedAt,
            startedAt: c.startedAt,
          }));
          setComplaints(transformedComplaints);
        }
      } else {
        console.log('❌ Staff not authenticated');
        navigate('/');
      }
    };

    initData();
  }, [navigate]);

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
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen, isSidebarOpen]);

  /* =========================
     FILTERING & SORTING
  ========================= */
  const getFilteredComplaints = () => {
    let filtered = [...complaints];
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter((c) => c.priority === filters.priority);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return filters.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return filtered;
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  /* =========================
     COMPLAINT DETAIL HANDLERS
  ========================= */
  const handleComplaintClick = async (complaint) => {
    // Optionally fetch fresh data for the complaint
    const freshComplaint = await fetchComplaintById(complaint.id);
    
    if (freshComplaint) {
      const transformedComplaint = {
        id: freshComplaint._id,
        title: freshComplaint.title,
        description: freshComplaint.description,
        category: freshComplaint.category,
        location: freshComplaint.landmark || freshComplaint.location || 'N/A',
        priority: freshComplaint.priority || 'medium',
        status: freshComplaint.status === 'in-progress' ? 'progress' : freshComplaint.status,
        date: new Date(freshComplaint.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        citizen: freshComplaint.citizen,
        assignedBy: freshComplaint.assignedBy,
        comment: freshComplaint.comment,
        resolutionNote: freshComplaint.resolutionNote,
        resolvedAt: freshComplaint.resolvedAt,
        startedAt: freshComplaint.startedAt,
      };
      setSelectedComplaint(transformedComplaint);
    } else {
      setSelectedComplaint(complaint);
    }
    
    setShowDetailPage(true);
    setIsUpdateButtonDisabled(complaint.status === 'resolved');
  };

  const handleBackToList = () => {
    setShowDetailPage(false);
    setSelectedComplaint(null);
  };

  const handleUpdateStatus = async () => {
    const newStatus = document.getElementById('updateStatus').value;
    const statusMap = {
      'pending': 'assigned',
      'progress': 'in-progress',
      'resolved': 'resolved',
    };
    const backendStatus = statusMap[newStatus] || newStatus;

    // Confirmation for resolved status
    if (newStatus === 'resolved') {
      const resolutionNote = prompt('Please provide a resolution note (required, min 10 characters):');
      
      if (!resolutionNote) {
        alert('Resolution note is required to mark as resolved');
        return;
      }
      
      if (resolutionNote.trim().length < 10) {
        alert('Resolution note must be at least 10 characters');
        return;
      }

      const confirmed = window.confirm(
        'Are you sure you want to set this complaint to "Resolved"? This action cannot be undone.'
      );
      
      if (!confirmed) {
        return;
      }

      // Update with resolution note
      const result = await updateComplaintStatus(selectedComplaint.id, {
        status: backendStatus,
        resolutionNote: resolutionNote.trim(),
      });

      if (result.success) {
        // Update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus, resolutionNote: resolutionNote.trim() } : c
          )
        );
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus, resolutionNote: resolutionNote.trim() }));
        setSuccessMessage('Thank you for your cooperation in resolving this complaint.');
        setIsUpdateButtonDisabled(true);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to update status');
      }
    } else {
      // Update for other statuses
      const result = await updateComplaintStatus(selectedComplaint.id, {
        status: backendStatus,
      });

      if (result.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
          )
        );
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
        setSuccessMessage('Status updated successfully!');
        setIsUpdateButtonDisabled(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.error || 'Failed to update status');
      }
    }
  };

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
  const getCategoryIcon = (category) => {
    const icons = {
      roads: '🛣️',
      water: '💧',
      power: '💡',
      sanitation: '🗑️',
      other: '📋',
    };
    return icons[category?.toLowerCase()] || '📋';
  };

  const getStatusText = (status) => {
    return status === 'progress'
      ? 'In Progress'
      : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const truncateDescription = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /* =========================
     RENDERING
  ========================= */

  const Loader = () => (
    <div className={styles.complaintsListLoader}>
      <div className={styles.loadingSpinner}></div>
      <div>Fetching complaints...</div>
    </div>
  );

  // Full Screen Loader
  if (hookLoading && !user) {
    return <div className={styles.fullLoading}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const filteredComplaints = getFilteredComplaints();

  return (
    <div className={styles.mainContainer}>
      {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}
      
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <h2>CitiSolve Staff</h2>
        <a onClick={() => navigate('/staff/home')} className={styles.navLink}>
          🏠 Home
        </a>
        <a className={`${styles.navLink} ${styles.active}`}>
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

      <div className={styles.main}>
        <div className={styles.topnav}>
          <div className={styles.menuIcon} onClick={toggleSidebar}>
            ☰
          </div>
          <div className={styles.breadcrumb}>
            <span>Department Complaints</span>
          </div>
          <div className={styles.profileSymbol} onClick={toggleProfileDropdown}>
            {user.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className={`${styles.profileDropdown} ${isProfileDropdownOpen ? styles.open : ''}`}>
            <div>
              <strong>Staff Member</strong>
            </div>
            <div>Name: {user.name}</div>
            <div>Email: {user.email}</div>
            <div>Department: {user.department}</div>
            <div>Location: {user.district}, {user.state}</div>
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
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
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {successMessage && (
            <div className={styles.successMessage} style={{ display: 'block' }}>
              {successMessage}
            </div>
          )}

          <div id="department-page" style={{ display: showDetailPage ? 'none' : 'block' }}>
            <div className={styles.welcomeSection}>
              <h1>📋 Department Complaints</h1>
              <div>Complaints assigned to your department, sorted by priority</div>
            </div>

            <div className={styles.complaintsContainer}>
              <div className={styles.filtersBar}>
                <div className={styles.filterGroup}>
                  <label>Priority:</label>
                  <select
                    id="dept-filter-priority"
                    className={styles.filterSelect}
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label>Status:</label>
                  <select
                    id="dept-filter-status"
                    className={styles.filterSelect}
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="assigned">Assigned</option>
                    <option value="progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className={styles.filterGroup}>
                  <label>Sort By:</label>
                  <select
                    id="dept-filter-sortby"
                    className={styles.filterSelect}
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              <div id="department-complaints-list" className={styles.complaintsListArea}>
                {hookLoading ? (
                  <Loader />
                ) : filteredComplaints.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔭</div>
                    <h3>No Complaints Found</h3>
                    <div>No complaints match your current filters.</div>
                  </div>
                ) : (
                  filteredComplaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className={styles.complaintItem}
                      onClick={() => handleComplaintClick(complaint)}
                      data-priority={complaint.priority}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.priorityIndicator}></div>
                      <div className={styles.complaintHeader}>
                        <div className={styles.complaintHeaderLeft}>
                          <div className={styles.complaintTitle}>{complaint.title}</div>
                          <div className={styles.complaintId}>CMPID: {complaint.id}</div>
                        </div>
                        <span className={`${styles.complaintBadge} ${styles['badge-' + complaint.status]}`}>
                          {getStatusText(complaint.status)}
                        </span>
                      </div>
                      <div className={styles.listDescription}>
                        {truncateDescription(complaint.description, 100)}
                      </div>
                      <div className={styles.complaintDetails}>
                        <span className={styles.detailItem}>
                          {getCategoryIcon(complaint.category)}{' '}
                          {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                        </span>
                        <span className={styles.detailItem}>📍 {complaint.location}</span>
                        <span className={styles.detailItem}>📅 {complaint.date}</span>
                        <span className={styles.detailItem}>
                          <span className={styles[`priority${complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}`]}>
                            ⚡ {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                          </span>
                          {' '}Priority
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div id="complaint-detail-page" style={{ display: showDetailPage ? 'block' : 'none' }}>
            <button className={styles.backButton} id="backToDept" onClick={handleBackToList}>
              ← Back to List
            </button>
            <div className={styles.welcomeSection}>
              <h1 id="detailComplaintTitle">
                {selectedComplaint ? selectedComplaint.title : 'Complaint Details'}
              </h1>
            </div>
            {selectedComplaint && (
              <>
                {selectedComplaint.status === 'resolved' && (
                  <div className={styles.resolvedMessage}>
                    This complaint has been marked as resolved.
                  </div>
                )}
                <div className={styles.formCard}>
                  <div id="complaintDetailContent">
                    <div className={styles.detailItemRow}>
                      <strong>CMPID:</strong>
                      <span>{selectedComplaint.id}</span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Title:</strong>
                      <span>{selectedComplaint.title}</span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Description:</strong>
                      <div className={styles.detailDescription}>
                        {selectedComplaint.description}
                      </div>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Category:</strong>
                      <span>{selectedComplaint.category}</span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Location:</strong>
                      <span>{selectedComplaint.location}</span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Priority:</strong>
                      <span className={styles[`priority${selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}`]}>
                        {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                      </span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Status:</strong>
                      <span className={styles[`status${selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)}`]}>
                        {getStatusText(selectedComplaint.status)}
                      </span>
                    </div>
                    <div className={styles.detailItemRow}>
                      <strong>Date:</strong>
                      <span>{selectedComplaint.date}</span>
                    </div>
                    {selectedComplaint.citizen && (
                      <div className={styles.detailItemRow}>
                        <strong>Citizen:</strong>
                        <span>{selectedComplaint.citizen.name} ({selectedComplaint.citizen.email})</span>
                      </div>
                    )}
                    {selectedComplaint.resolutionNote && (
                      <div className={styles.detailItemRow}>
                        <strong>Resolution Note:</strong>
                        <div className={styles.detailDescription}>
                          {selectedComplaint.resolutionNote}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.detailActions}>
                    <select
                      id="updateStatus"
                      className={styles.filterSelect}
                      defaultValue={selectedComplaint.status}
                      disabled={isUpdateButtonDisabled}
                    >
                      <option value="pending">Assigned</option>
                      <option value="progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      className={styles.btnPrimary}
                      id="updateComplaintBtn"
                      onClick={handleUpdateStatus}
                      disabled={isUpdateButtonDisabled}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </>
            )}
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

export default DepartmentComplaints;