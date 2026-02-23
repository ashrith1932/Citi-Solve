import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './staffsearchstyle.module.css';
import { useStaffSearch } from './hooks/staffsearchhook.jsx';

const Loader = () => (
  <div className={styles.complaintsListLoader}>
    <div className={styles.loadingSpinner}></div>
    <div>Fetching complaints...</div>
  </div>
);

const SearchStaff = () => {
  const navigate = useNavigate();
  
  // Destructure logic from the hook
  const {
    loading: hookLoading,
    fetchProfile,
    fetchAllComplaints,
    advancedSearch,
    fetchComplaintById,
    updateComplaintStatus,
    logoutStaff,
  } = useStaffSearch();

  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [complaintsData, setComplaintsData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    priority: '',
    keyword: '',
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(false);
  
  const sidebarRef = useRef(null);
  const menuIconRef = useRef(null);
  
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

        // 2. Fetch All Complaints
        console.log('📋 Fetching all complaints...');
        const complaints = await fetchAllComplaints();
        
        if (complaints) {
          console.log('✅ Complaints received:', complaints);
          // Transform backend data
          const transformedComplaints = complaints.map(c => ({
            id: c._id,
            title: c.title,
            description: c.description,
            category: c.category,
            location: c.landmark || c.location || 'N/A',
            priority: c.priority || 'medium',
            status: c.status === 'in-progress' ? 'progress' : c.status === 'assigned' ? 'pending' : c.status,
            date: new Date(c.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            rawDate: c.createdAt, // Keep for filtering
            citizen: c.citizen,
            assignedBy: c.assignedBy,
            comment: c.comment,
            resolutionNote: c.resolutionNote,
            resolvedAt: c.resolvedAt,
            startedAt: c.startedAt,
          }));
          setComplaintsData(transformedComplaints);
          setSearchResults(transformedComplaints);
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
      if (isProfileDropdownOpen && !event.target.closest(`.${styles.profileDropdown}`) && !event.target.closest(`.${styles.profileSymbol}`)) {
        setIsProfileDropdownOpen(false);
      }

      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && menuIconRef.current && !menuIconRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isProfileDropdownOpen, isSidebarOpen]);

  /* =========================
     HANDLE FILTER CHANGES
  ========================= */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    const filterMap = {
      'searchDateFrom': 'dateFrom',
      'searchDateTo': 'dateTo',
      'searchStatus': 'status',
      'searchPriority': 'priority',
      'searchKeyword': 'keyword'
    };
    
    const filterKey = filterMap[id];
    if (filterKey) {
      setSearchFilters(prevState => ({
        ...prevState,
        [filterKey]: value,
      }));
    }
  };

  /* =========================
     CLIENT-SIDE FILTERING
     (Filters local data by priority)
  ========================= */
  const filterLocalResults = (results) => {
    let filtered = [...results];
    
    // Client-side priority filtering
    if (searchFilters.priority) {
      filtered = filtered.filter(c => 
        c.priority && c.priority.toLowerCase() === searchFilters.priority.toLowerCase()
      );
    }
    
    return filtered;
  };

  /* =========================
     SEARCH HANDLER
     (Uses advanced search API for server-side filtering)
  ========================= */
  const handleSearch = async () => {
    const { dateFrom, dateTo, status, keyword } = searchFilters;

    // Use advanced search API
    const searchParams = {
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      status: status || 'all',
      keyword: keyword.trim() || '',
      page: 1,
      limit: 100,
    };

    const result = await advancedSearch(searchParams);
    
    if (result.complaints) {
      // Transform results
      const transformedComplaints = result.complaints.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description,
        category: c.category,
        location: c.landmark || c.location || 'N/A',
        priority: c.priority || 'medium',
        status: c.status === 'in-progress' ? 'progress' : c.status === 'assigned' ? 'pending' : c.status,
        date: new Date(c.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        rawDate: c.createdAt,
        citizen: c.citizen,
        assignedBy: c.assignedBy,
        comment: c.comment,
        resolutionNote: c.resolutionNote,
        resolvedAt: c.resolvedAt,
        startedAt: c.startedAt,
      }));
      
      // Apply client-side priority filter
      const filteredResults = filterLocalResults(transformedComplaints);
      setSearchResults(filteredResults);
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      dateFrom: '',
      dateTo: '',
      status: '',
      priority: '',
      keyword: '',
    });
    setSearchResults(complaintsData);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /* =========================
     COMPLAINT DETAIL HANDLERS
  ========================= */
  const handleComplaintClick = async (complaint) => {
    // Fetch fresh complaint data
    const freshComplaint = await fetchComplaintById(complaint.id);
    
    if (freshComplaint) {
      const transformedComplaint = {
        id: freshComplaint._id,
        title: freshComplaint.title,
        description: freshComplaint.description,
        category: freshComplaint.category,
        location: freshComplaint.landmark || freshComplaint.location || 'N/A',
        priority: freshComplaint.priority || 'medium',
        status: freshComplaint.status === 'in-progress' ? 'progress' : freshComplaint.status === 'assigned' ? 'pending' : freshComplaint.status,
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
    setSuccessMessage('');
  };

  const handleUpdateStatus = async () => {
    const newStatus = document.getElementById('updateStatus').value;
    const statusMap = {
      'pending': 'assigned',
      'progress': 'in-progress',
      'resolved': 'resolved',
    };
    const backendStatus = statusMap[newStatus] || newStatus;
    const isCurrentlyResolved = selectedComplaint.status === 'resolved';

    if (isCurrentlyResolved && newStatus !== 'resolved') {
      alert('A resolved complaint cannot be reverted.');
      return;
    }

    if (newStatus === 'resolved' && !isCurrentlyResolved) {
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
        // Update local states
        setComplaintsData((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus, resolutionNote: resolutionNote.trim() } : c
          )
        );
        setSearchResults((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus, resolutionNote: resolutionNote.trim() } : c
          )
        );
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus, resolutionNote: resolutionNote.trim() }));
        setSuccessMessage('Thank you for your cooperation in resolving this complaint.');
        setIsUpdateButtonDisabled(true);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(result.error || 'Failed to update status');
      }
    } else {
      // Update for other statuses
      const result = await updateComplaintStatus(selectedComplaint.id, {
        status: backendStatus,
      });

      if (result.success) {
        setComplaintsData((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
          )
        );
        setSearchResults((prev) =>
          prev.map((c) =>
            c.id === selectedComplaint.id ? { ...c, status: newStatus } : c
          )
        );
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
        setSuccessMessage('Status updated successfully!');
        setIsUpdateButtonDisabled(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(result.error || 'Failed to update status');
      }
    }
  };

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
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

  // Full Screen Loader
  if (hookLoading && !user) {
    return <div className={styles.pageLoader}><div className={styles.loadingSpinner}></div><div>Loading...</div></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.mainContainer}>
      {isSidebarOpen && <div className={styles.sidebarOverlay} onClick={toggleSidebar}></div>}

      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`} ref={sidebarRef}>
        <h2>CitiSolve Staff</h2>
        <a onClick={() => navigate("/staff/home")} className={styles.navLink}>
          🏠 Home
        </a>
        <a onClick={() => navigate("/staff/departmentcomplaints")} className={styles.navLink}>
          📋 Department Complaints
        </a>
        <a className={`${styles.navLink} ${styles.active}`}>
          🔍 Advanced Search
        </a>
        <a onClick={() => navigate("/staff/faq")} className={styles.navLink}>
          ❓ FAQ
        </a>
        <a onClick={() => navigate("/staff/support")} className={styles.navLink}>
          💬 Support
        </a>
        <a onClick={() => navigate("/staff/userguide")} className={styles.navLink}>
          📖 User Guide
        </a>
      </div>

      <div className={styles.main}>
        <div className={styles.topnav}>
          <div className={styles.menuIcon} onClick={toggleSidebar} ref={menuIconRef}>
            ☰
          </div>
          <div className={styles.breadcrumb}>
            <span>Advanced Search</span>
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
              <a onClick={handleLogout} style={{ color: '#4a90e2', textDecoration: 'none', cursor: 'pointer' }}>
                Logout
              </a>
            </div>
          </div>
        </div>

        <div className={styles.content} id="search-page">
          {successMessage && (
            <div className={styles.successMessage} style={{ display: 'block' }}>
              {successMessage}
            </div>
          )}
          {!showDetailPage ? (
            <>
              <div className={styles.welcomeSection}>
                <h1>🔍 Advanced Search</h1>
                <div>Search complaints by multiple criteria</div>
              </div>
              <div className={styles.formCard}>
                <h2 style={{ marginBottom: '24px' }}>Search Filters</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="searchDateFrom">Date From:</label>
                  <input 
                    type="date" 
                    id="searchDateFrom" 
                    onChange={handleInputChange} 
                    onKeyPress={handleKeyPress}
                    value={searchFilters.dateFrom}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="searchDateTo">Date To:</label>
                  <input 
                    type="date" 
                    id="searchDateTo" 
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    value={searchFilters.dateTo} 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="searchStatus">Status:</label>
                  <select 
                    id="searchStatus" 
                    onChange={handleInputChange} 
                    value={searchFilters.status}
                  >
                    <option value="">All</option>
                    <option value="assigned">Assigned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="searchPriority">Priority:</label>
                  <select 
                    id="searchPriority" 
                    onChange={handleInputChange} 
                    value={searchFilters.priority}
                  >
                    <option value="">All</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="searchKeyword">Keyword:</label>
                  <input 
                    type="text" 
                    id="searchKeyword" 
                    placeholder="Search by title, description, or location" 
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    value={searchFilters.keyword} 
                  />
                </div>
                
                <div className={styles.buttonGroup}>
                  <button className={styles.btnPrimary} onClick={handleSearch}>
                    Search
                  </button>
                  <button className={styles.btnSecondary} onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
              
              <div className={styles.complaintsContainer} style={{ marginTop: '24px' }}>
                <div className={styles.complaintsHeader}>
                  Search Results ({searchResults.length} {searchResults.length === 1 ? 'complaint' : 'complaints'})
                </div>
                <div id="search-results-list">
                  {hookLoading ? (
                    <Loader />
                  ) : searchResults.length > 0 ? (
                    searchResults.map(complaint => {
                      const statusClass = 'badge-' + complaint.status;
                      const statusText = getStatusText(complaint.status);
                      return (
                        <div
                          className={styles.complaintItem}
                          key={complaint.id}
                          onClick={() => handleComplaintClick(complaint)}
                          data-priority={complaint.priority}
                        >
                          <div className={styles.priorityIndicator}></div>
                          <div className={styles.complaintHeader}>
                            <div className={styles.complaintHeaderLeft}>
                              <div className={styles.complaintTitle}>{complaint.title}</div>
                              <div className={styles.complaintId}>CMPID: {complaint.id}</div>
                            </div>
                            <div className={`${styles.complaintBadge} ${styles[statusClass]}`}>{statusText}</div>
                          </div>
                          <div className={styles.listDescription}>
                            {truncateDescription(complaint.description, 100)}
                          </div>
                          <div className={styles.complaintDetails}>
                            <div className={styles.detailItem}>
                              <div className={styles.detailIcon}>📍</div>
                              <div className={styles.detailText}>{complaint.location}</div>
                            </div>
                            <div className={styles.detailItem}>
                              <div className={styles.detailIcon}>📅</div>
                              <div className={styles.detailText}>{complaint.date}</div>
                            </div>
                            <div className={styles.detailItem}>
                              <div className={styles.detailIcon}>⚡</div>
                              <div className={`${styles.detailText} ${styles[`priority${complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}`]}`}>
                                {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.noResults}>
                      <div className={styles.noResultsText}>No complaints match your search criteria.</div>
                      <button className={styles.btnSecondary} onClick={handleClearFilters}>
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div id="complaint-detail-page" className={styles.formCard}>
              {hookLoading && <Loader />}
              <button className={styles.backButton} id="backToSearch" onClick={handleBackToList}>
                ← Back to Search
              </button>
              <div className={styles.welcomeSection}>
                <h1 id="detailComplaintTitle">Complaint Details</h1>
              </div>
              
              {selectedComplaint && (
                <>
                  {selectedComplaint.status === 'resolved' && (
                    <div className={styles.resolvedMessage}>
                      This complaint has been marked as resolved.
                    </div>
                  )}
                  <div id="complaintDetailContent">
                    <div className={styles.detailField}>
                      <strong>CMPID:</strong> <div>{selectedComplaint.id}</div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Title:</strong> <div>{selectedComplaint.title}</div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Description:</strong> 
                      <div className={styles.detailDescription}>
                        {selectedComplaint.description}
                      </div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Category:</strong> <div>{selectedComplaint.category}</div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Location:</strong> <div>{selectedComplaint.location}</div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Priority:</strong> 
                      <div className={styles[`priority${selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}`]}>
                        {selectedComplaint.priority.charAt(0).toUpperCase() + selectedComplaint.priority.slice(1)}
                      </div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Status:</strong> 
                      <div className={styles[`status${selectedComplaint.status.charAt(0).toUpperCase() + selectedComplaint.status.slice(1)}`]}>
                        {getStatusText(selectedComplaint.status)}
                      </div>
                    </div>
                    <div className={styles.detailField}>
                      <strong>Date:</strong> <div>{selectedComplaint.date}</div>
                    </div>
                    {selectedComplaint.citizen && (
                      <div className={styles.detailField}>
                        <strong>Citizen:</strong>
                        <div>{selectedComplaint.citizen.name} ({selectedComplaint.citizen.email})</div>
                      </div>
                    )}
                    {selectedComplaint.resolutionNote && (
                      <div className={styles.detailField}>
                        <strong>Resolution Note:</strong>
                        <div className={styles.detailDescription}>
                          {selectedComplaint.resolutionNote}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.updateStatusContainer}>
                    <select
                      id="updateStatus"
                      className={styles.updateStatusSelect}
                      defaultValue={selectedComplaint.status}
                      disabled={isUpdateButtonDisabled}
                    >
                      <option value="pending">Assigned</option>
                      <option value="progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      className={styles.updateStatusBtn}
                      id="updateComplaintBtn"
                      onClick={handleUpdateStatus}
                      disabled={isUpdateButtonDisabled}
                    >
                      Update Status
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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

export default SearchStaff;