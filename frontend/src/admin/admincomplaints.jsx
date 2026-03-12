import React, { useEffect, useState } from 'react';
import styles from './admincomplaintsstyles.module.css';
import { useAdminComplaints } from './hooks/admincomplaintshook.jsx';

const ComplaintsPage = () => {
  const {
    loading: hookLoading,
    fetchComplaints,
    fetchComplaintById,
  } = useAdminComplaints();

  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* =========================
     INITIAL DATA FETCH
  ========================= */
  useEffect(() => {
    const initData = async () => {
      console.log('📋 Fetching complaints...');
      const result = await fetchComplaints({
        status: 'all',
        category: 'all',
        limit: 100,
      });
      
      if (result.complaints) {
        console.log('✅ Complaints received:', result.complaints);
        setComplaints(result.complaints);
      }
    };

    initData();
  }, []);

  /* =========================
     FILTER HANDLERS
  ========================= */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredComplaints = () => {
    return complaints.filter((c) => {
      const statusMatch = filters.status === 'all' || c.status === filters.status;
      const categoryMatch = filters.category === 'all' || c.category === filters.category;

      if (searchTerm === '') {
        return statusMatch && categoryMatch;
      }

      const searchLower = searchTerm.toLowerCase();
      
      const searchableFields = [
        c._id?.toString(),
        c.citizen?.name?.toString(),
        c.citizen?.email?.toString(),
        c.title?.toString(),
        c.description?.toString(),
        c.category?.toString(),
        c.landmark?.toString(),
        c.status?.toString(),
        c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
        c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : '',
        c.assignedTo?.name?.toString(),
      ];

      const searchMatch = searchableFields.some(field => 
        field && field.toLowerCase().includes(searchLower)
      );

      return statusMatch && categoryMatch && searchMatch;
    });
  };

  /* =========================
     EXPORT CSV
  ========================= */
  const handleExportCSV = () => {
    const filteredComplaints = getFilteredComplaints();
    
    if (filteredComplaints.length === 0) {
      alert('No complaints to export');
      return;
    }

    const headers = [
      'ID',
      'Citizen Name',
      'Citizen Email',
      'Title',
      'Description',
      'Category',
      'Location',
      'Status',
      'State',
      'District',
      'Created At',
      'Resolved At',
      'Assigned To'
    ];

    const csvRows = [
      headers.join(','),
      ...filteredComplaints.map(c => {
        const formattedCreatedAt = c.createdAt ? `"${new Date(c.createdAt).toLocaleString().replace(/"/g, '""')}"` : '""';
        const formattedResolvedAt = c.resolvedAt ? `"${new Date(c.resolvedAt).toLocaleString().replace(/"/g, '""')}"` : '""';

        const row = [
          `"${c._id || ''}"`,
          `"${c.citizen?.name || ''}"`,
          `"${c.citizen?.email || ''}"`,
          `"${(c.title || '').replace(/"/g, '""')}"`,
          `"${(c.description || '').replace(/"/g, '""')}"`,
          `"${c.category || ''}"`,
          `"${(c.landmark || '').replace(/"/g, '""')}"`,
          `"${c.status || ''}"`,
          `"${c.state || ''}"`,
          `"${c.district || ''}"`,
          formattedCreatedAt,
          formattedResolvedAt,
          `"${c.assignedTo?.name || 'Unassigned'}"`
        ];
        return row.join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `complaints_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  /* =========================
     DETAIL MODAL
  ========================= */
  const handleViewDetails = async (complaint) => {
    // Fetch fresh data for the complaint
    const freshComplaint = await fetchComplaintById(complaint._id);
    setSelectedComplaint(freshComplaint || complaint);
    setShowDetailModal(true);
  };

  const handleImageClick = (index = 0) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
  const getStatusBadge = (status) => {
    if (!status) return 'N/A';
    const statusText = status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1);
    let badgeClass = '';
    if (status === 'pending') badgeClass = 'badgePending';
    else if (status === 'assigned') badgeClass = 'badgeProgress';
    else if (status === 'in-progress') badgeClass = 'badgeProgress';
    else if (status === 'resolved') badgeClass = 'badgeResolved';
    else if (status === 'rejected') badgeClass = 'badgeDanger';
    return <span className={`${styles.badge} ${styles[badgeClass]}`}>{statusText}</span>;
  };

  /* =========================
     RENDER TABLE
  ========================= */
  const renderTableBody = () => {
    if (hookLoading) {
      return (
        <tr>
          <td colSpan="9" className={styles.loadingCell}>
            <div className={styles.spinner}></div>
            <p>Loading complaints...</p>
          </td>
        </tr>
      );
    }

    const filteredComplaints = getFilteredComplaints();
    if (filteredComplaints.length === 0) {
      return (
        <tr>
          <td colSpan="9" className={styles.noDataCell}>
            No complaints found
          </td>
        </tr>
      );
    }

    return filteredComplaints.map((c) => (
      <tr key={c._id}>
        <td data-label="ID">
          <strong>{c._id.slice(-6)}</strong>
        </td>
        <td data-label="Citizen" className={styles.truncatedText} title={c.citizen?.name}>
          {c.citizen?.name || 'N/A'}
        </td>
        <td data-label="Email" className={styles.truncatedText} title={c.citizen?.email}>
          {c.citizen?.email || 'N/A'}
        </td>
        <td data-label="Title" className={styles.truncatedText} title={c.title}>
          {c.title}
        </td>
        <td data-label="Category">
          {c.category ? c.category.charAt(0).toUpperCase() + c.category.slice(1) : 'N/A'}
        </td>
        <td data-label="Location" className={styles.truncatedText} title={c.landmark}>
          {c.landmark}
        </td>
        <td data-label="Status">{getStatusBadge(c.status)}</td>
        <td data-label="Actions" className={styles.actionCell}>
          <button className={`${styles.actionBtn} ${styles.view}`} title="View Details" onClick={() => handleViewDetails(c)}>
            👁️
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.pageHeader}>
        <h2>All Complaints</h2>
        <div className={styles.pageActions}>
          <button className={styles.btnPrimary} onClick={handleExportCSV}>📥 Export CSV</button>
          <button
            className={styles.btnSecondary}
            onClick={async () => {
              const result = await fetchComplaints({ status: 'all', category: 'all', limit: 100 });
              setComplaints(result.complaints);
              setFilters({ status: 'all', category: 'all' });
              setSearchTerm('');
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label>Status:</label>
          <select name="status" className={styles.filterSelect} value={filters.status} onChange={handleFilterChange}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Category:</label>
          <select name="category" className={styles.filterSelect} value={filters.category} onChange={handleFilterChange}>
            <option value="all">All Categories</option>
            <option value="roads">Roads</option>
            <option value="water">Water</option>
            <option value="power">Power</option>
            <option value="sanitation">Sanitation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 Search across all fields..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Citizen</th>
              <th>Email</th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className={styles.modalBackdrop} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Complaint Details</h3>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <strong>ID:</strong>
                  <span>{selectedComplaint._id}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Citizen:</strong>
                  <span>{selectedComplaint.citizen?.name || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Email:</strong>
                  <span>{selectedComplaint.citizen?.email || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Category:</strong>
                  <span>{selectedComplaint.category?.charAt(0).toUpperCase() + selectedComplaint.category?.slice(1)}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Status:</strong>
                  <span>{getStatusBadge(selectedComplaint.status)}</span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <strong>Title:</strong>
                  <span>{selectedComplaint.title}</span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <strong>Location:</strong>
                  <span>{selectedComplaint.landmark}, {selectedComplaint.district}, {selectedComplaint.state}</span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <strong>Created At:</strong>
                  <span>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <strong>Resolved At:</strong>
                  <span>{selectedComplaint.resolvedAt ? new Date(selectedComplaint.resolvedAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <strong>Assigned To:</strong>
                  <span>
                    {selectedComplaint.assignedTo?.name || 'Unassigned'} 
                    {selectedComplaint.assignedTo && ` (${selectedComplaint.assignedTo.email})`}
                  </span>
                </div>
                {selectedComplaint.resolutionNote && (
                  <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <strong>Resolution Note:</strong>
                    <p>{selectedComplaint.resolutionNote}</p>
                  </div>
                )}
                <div className={`${styles.detailItem} ${styles.fullWidth} ${styles.description}`}>
                  <strong>Description:</strong>
                  <p>{selectedComplaint.description || 'N/A'}</p>
                </div>
                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                  <div className={`${styles.detailItem} ${styles.fullWidth} ${styles.imageContainer}`}>
                    <strong>Images:</strong>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {selectedComplaint.images.map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Complaint ${idx + 1}`} 
                          onClick={() => handleImageClick(idx)} 
                          style={{ cursor: 'pointer', maxWidth: '200px', maxHeight: '200px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && selectedComplaint && selectedComplaint.images && selectedComplaint.images.length > 0 && (
        <div className={styles.imageViewer} onClick={() => setShowImageViewer(false)}>
          <button className={styles.closeImageViewer} onClick={() => setShowImageViewer(false)}>
            ×
          </button>
          <img 
            src={selectedComplaint.images[currentImageIndex]} 
            alt="Complaint Full Screen" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;