import { useState, useEffect } from 'react';
import './HODPage.css';

const HODPage = ({ user, onLogout, documents, updateDocuments }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editingData, setEditingData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => {
    if (selectedDocument) {
      setEditingData([...selectedDocument.data]);
    }
  }, [selectedDocument]);

  const pendingDocuments = documents.filter(doc => doc.status === 'pending');
  const completedDocuments = documents.filter(doc => doc.status === 'completed');

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    setEditingData([...doc.data]);
    setActiveTab('edit');
  };

  const handleBackToDocuments = () => {
    setSelectedDocument(null);
    setEditingData([]);
    setActiveTab('documents');
  };

  const handleCellEdit = (id, field, value) => {
    setEditingData(editingData.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
    setEditingCell(null);
  };

  const handleSubmitDocument = () => {
    if (!selectedDocument) return;

    const updatedDocument = {
      ...selectedDocument,
      data: editingData,
      status: 'completed',
      completedAt: new Date().toLocaleString(),
      completedBy: user.email
    };

    const updatedDocuments = documents.map(doc => 
      doc.id === selectedDocument.id ? updatedDocument : doc
    );

    updateDocuments(updatedDocuments);
    setSelectedDocument(null);
    setEditingData([]);
    setActiveTab('documents');
    
    alert('Document submitted successfully!');
  };

  const getIncompleteFields = (data) => {
    let incompleteCount = 0;
    data.forEach(course => {
      Object.values(course).forEach(value => {
        if (!value || value === '') incompleteCount++;
      });
    });
    return incompleteCount;
  };

  return (
    <div className="hod-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>HOD Dashboard</h1>
            <div className="header-info">
              <span className="user-info">Welcome, {user.name}</span>
              <button onClick={onLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="dashboard-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Pending Documents</h3>
              <div className="stat-number">{pendingDocuments.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completed Documents</h3>
              <div className="stat-number">{completedDocuments.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Documents</h3>
              <div className="stat-number">{documents.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <div className="stat-number">
                {documents.length > 0 ? Math.round((completedDocuments.length / documents.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          {selectedDocument && (
            <button 
              className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit Document
            </button>
          )}
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {activeTab === 'documents' && (
          <div className="tab-content fade-in">
            <h2>Received Documents</h2>
            
            {pendingDocuments.length > 0 && (
              <div className="document-section">
                <h3>Pending Review</h3>
                <div className="documents-grid">
                  {pendingDocuments.map(doc => (
                    <div key={doc.id} className="document-card pending-card">
                      <div className="document-header">
                        <h4>{doc.title}</h4>
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                      <div className="document-info">
                        <p><strong>Sent by:</strong> {doc.sentBy}</p>
                        <p><strong>Received:</strong> {doc.sentAt}</p>
                        <p><strong>Courses:</strong> {doc.data.length}</p>
                        <p><strong>Incomplete fields:</strong> {getIncompleteFields(doc.data)}</p>
                      </div>
                      <button 
                        onClick={() => handleDocumentSelect(doc)}
                        className="btn btn-primary"
                      >
                        Review & Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingDocuments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3>No Pending Documents</h3>
                <p>You have no documents pending review at this time.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && selectedDocument && (
          <div className="tab-content fade-in">
            <div className="edit-header">
              <button onClick={handleBackToDocuments} className="btn btn-secondary">
                ← Back to Documents
              </button>
              <h2>Edit: {selectedDocument.title}</h2>
              <button onClick={handleSubmitDocument} className="btn btn-success">
                Submit Document
              </button>
            </div>

            <div className="card">
              <div className="document-meta">
                <div className="meta-info">
                  <p><strong>Sent by:</strong> {selectedDocument.sentBy}</p>
                  <p><strong>Received:</strong> {selectedDocument.sentAt}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${selectedDocument.status}`}>
                      {selectedDocument.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="edit-instructions">
                <div className="alert alert-info">
                  <strong>Instructions:</strong> Click on any cell to edit its content. 
                  Please fill in any missing information and verify all entries are accurate.
                </div>
              </div>

              <div className="table-responsive">
                <table className="table edit-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Semester</th>
                      <th>Professor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingData.map(course => (
                      <tr key={course.id} className={!course.professor || course.professor === '' ? 'incomplete-row' : ''}>
                        <td>
                          {editingCell === `${course.id}-department` ? (
                            <input
                              type="text"
                              defaultValue={course.department}
                              onBlur={(e) => handleCellEdit(course.id, 'department', e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-department`)}
                              className={!course.department ? 'empty-field' : ''}
                            >
                              {course.department || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${course.id}-code` ? (
                            <input
                              type="text"
                              defaultValue={course.code}
                              onBlur={(e) => handleCellEdit(course.id, 'code', e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-code`)}
                              className={!course.code ? 'empty-field' : ''}
                            >
                              {course.code || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${course.id}-name` ? (
                            <input
                              type="text"
                              defaultValue={course.name}
                              onBlur={(e) => handleCellEdit(course.id, 'name', e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-name`)}
                              className={!course.name ? 'empty-field' : ''}
                            >
                              {course.name || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${course.id}-credits` ? (
                            <input
                              type="number"
                              defaultValue={course.credits}
                              onBlur={(e) => handleCellEdit(course.id, 'credits', parseInt(e.target.value))}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-credits`)}
                              className={!course.credits ? 'empty-field' : ''}
                            >
                              {course.credits || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${course.id}-semester` ? (
                            <input
                              type="text"
                              defaultValue={course.semester}
                              onBlur={(e) => handleCellEdit(course.id, 'semester', e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-semester`)}
                              className={!course.semester ? 'empty-field' : ''}
                            >
                              {course.semester || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {editingCell === `${course.id}-professor` ? (
                            <input
                              type="text"
                              defaultValue={course.professor}
                              onBlur={(e) => handleCellEdit(course.id, 'professor', e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingCell(`${course.id}-professor`)}
                              className={!course.professor ? 'empty-field' : ''}
                            >
                              {course.professor || 'Click to edit'}
                            </span>
                          )}
                        </td>
                        <td>
                          {!course.professor || course.professor === '' ? (
                            <span className="status-badge status-incomplete">Incomplete</span>
                          ) : (
                            <span className="status-badge status-complete">Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content fade-in">
            <h2>Document History</h2>
            
            <div className="card">
              {documents.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No Document History</h3>
                  <p>No documents have been processed yet.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Sent By</th>
                      <th>Received Date</th>
                      <th>Completed Date</th>
                      <th>Status</th>
                      <th>Courses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id}>
                        <td>{doc.title}</td>
                        <td>{doc.sentBy}</td>
                        <td>{doc.sentAt}</td>
                        <td>{doc.completedAt || '-'}</td>
                        <td>
                          <span className={`status-badge status-${doc.status}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>{doc.data.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HODPage;