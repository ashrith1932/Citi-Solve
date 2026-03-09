import React, { useState, useEffect } from 'react';
import styles from './adminusersstyle.module.css';
import { useAdminUsers } from './hooks/adminusershooks.jsx';

const UsersPage = () => {
  const {
    loading: hookLoading,
    fetchUsers,
    fetchUserById,
    deleteUser,
  } = useAdminUsers();

  const [usersData, setUsersData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);


  /* =========================
     FETCH USERS (WITH DEBOUNCE)
  ========================= */
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      setPageLoading(true);
      console.log('👥 Fetching users...');
      const result = await fetchUsers({
        search: searchTerm,
        limit: 100,
      });
      
      if (result.users) {
        console.log('✅ Users received:', result.users);
        setUsersData(result.users);
      }
      setPageLoading(false);
    }, 500); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  /* =========================
     SEARCH HANDLER
  ========================= */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /* =========================
     DETAIL MODAL
  ========================= */
  const handleViewDetails = async (user) => {
    const freshUser = await fetchUserById(user._id);
    setSelectedUser(freshUser || user);
    setShowDetailModal(true);
  };

  /* =========================
     DELETE USER
  ========================= */
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    const result = await deleteUser(selectedUser._id);

    if (result.success) {
      setUsersData(usersData.filter((u) => u._id !== selectedUser._id));
      alert(
        `User deleted successfully.\n` +
        `${result.deletedComplaints || 0} complaint(s) also deleted.`
      );
    } else {
      alert('Failed to delete user: ' + (result.error || 'Unknown error'));
    }
    
    setShowConfirmModal(false);
  };

  /* =========================
     EXPORT CSV
  ========================= */
  const handleExportCSV = () => {
    if (usersData.length === 0) {
      alert('No users to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined Date'];
    
    const csvRows = usersData.map(user => [
      user._id || '',
      user.name || '',
      user.email || '',
      user.role || '',
      user.createdAt ? new Date(user.createdAt).toLocaleString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  /* =========================
     UTILITY FUNCTIONS
  ========================= */
  const getUserTypeBadge = (role) => {
    let badgeClass = '';
    if (role === 'citizen') badgeClass = 'badgePrimary';
    else if (role === 'staff') badgeClass = 'badgeProgress';
    else if (role === 'admin') badgeClass = 'badgeDanger';
    return <span className={`${styles.badge} ${styles[badgeClass]}`}>{role.toUpperCase()}</span>;
  };

  /* =========================
     RENDER TABLE
  ========================= */
  const renderTableBody = () => {
    if (pageLoading || hookLoading) {
      return (
        <tr>
          <td colSpan="6" className={styles.loadingCell}>
            <div className={styles.spinner}></div>
            <p>Loading users...</p>
          </td>
        </tr>
      );
    }

    if (usersData.length === 0) {
      return (
        <tr>
          <td colSpan="6" className={styles.noDataCell}>
            No users found
          </td>
        </tr>
      );
    }

    return usersData.map((user) => {
      if (!user) return null;
      return (
        <tr key={user._id}>
          <td data-label="ID">
            <strong>{user._id.slice(-6)}</strong>
          </td>
          <td data-label="Name" className={styles.truncatedText} title={user.name}>
            {user.name}
          </td>
          <td data-label="Email" className={styles.truncatedText} title={user.email}>
            {user.email || 'N/A'}
          </td>
          <td data-label="Type">{getUserTypeBadge(user.role)}</td>
          <td data-label="Joined">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </td>
          <td data-label="Actions" className={styles.actionCell}>
            <button 
              className={`${styles.actionBtn} ${styles.view}`} 
              title="View Details" 
              onClick={() => handleViewDetails(user)}
            >
              👁️
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.delete}`} 
              title="Delete" 
              onClick={() => handleDeleteClick(user)}
            >
              🗑️
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.pageHeader}>
        <h2>All Users (Citizens)</h2>
        <div className={styles.pageActions}>
          <button className={styles.btnSecondary} onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button
            className={styles.btnSecondary}
            onClick={async () => {
              setPageLoading(true);
              const result = await fetchUsers({ limit: 100 });
              setUsersData(result.users);
              setPageLoading(false);
              setSearchTerm('');
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={`${styles.filterGroup} ${styles.searchGroup}`}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="🔍 Search by Name or Email..."
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
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className={styles.modalBackdrop} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>User Details</h3>
              <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <strong>ID:</strong>
                  <span>{selectedUser._id}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Name:</strong>
                  <span>{selectedUser.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Email:</strong>
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Type:</strong>
                  <span>{getUserTypeBadge(selectedUser.role)}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Joined:</strong>
                  <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Account Verified:</strong>
                  <span>{selectedUser.isAccountVerified ? 'Yes' : 'No'}</span>
                </div>
                
                {selectedUser.complaints && selectedUser.complaints.length > 0 && (
                  <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <strong>Complaints Filed ({selectedUser.complaints.length}):</strong>
                    <ul style={{ margin: '10px 0', paddingLeft: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                      {selectedUser.complaints.map((complaint, idx) => (
                        <li key={idx}>
                          <strong>{complaint.title}</strong> - 
                          <em> {complaint.status}</em> - 
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && selectedUser && (
        <div className={styles.modalBackdrop} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Confirm Deletion</h3>
              <button className={styles.closeBtn} onClick={() => setShowConfirmModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to delete user <strong>{selectedUser.name}</strong>?
              </p>
              <p style={{ color: '#e76f51', marginTop: '10px' }}>
                ⚠️ This will also delete all complaints filed by this user.
              </p>
              <div className={styles.modalActions}>
                <button className={styles.btnSecondary} onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button className={styles.btnDanger} onClick={handleConfirmDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;