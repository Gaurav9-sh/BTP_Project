import { useState, useEffect, useRef } from 'react';
import './HODPage.css'; // Your original CSS
import './AcademicsPage.css'; // We need this for the new table styles
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaSearch } from "react-icons/fa";
// We removed all 'api.js' imports because this page edits a local document

// --- CONSTANTS & HELPER COMPONENTS ---
// We must copy these from AcademicsPage to use them here.

const DUMMY_FACULTY_DATA = [
  { id: 1678880000001, name: "Dr. Aisha Sharma", designation: "Dr.", firstName: "Aisha", middleName: "", lastName: "Sharma", employeeId: "F001", email: "aisha@lnmiit.ac.in", department: "Computer Science and Engineering", addedAt: "2025-11-10, 8:00:00 PM", addedBy: "admin@lnmiit.ac.in" },
  { id: 1678880000002, name: "Prof. Vikram Singh", designation: "Prof.", firstName: "Vikram", middleName: "", lastName: "Singh", employeeId: "F002", email: "vikram@lnmiit.ac.in", department: "Electronics and Communication Engineering", addedAt: "2025-11-10, 8:01:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  // ... (add all other faculty) ...
];

const BATCH_OPTIONS = [
    { name: 'CSE-A', code: 'CSE-A', capacity: 120 },
    { name: 'CSE-B', code: 'CSE-B', capacity: 120 },
    { name: 'CCE', code: 'CCE', capacity: 120 },
    { name: 'ECE', code: 'ECE', capacity: 120 },
    { name: 'ME', code: 'ME', capacity: 120 },
];

const calculateTotalStudents = (batchCodes) => {
    return batchCodes.reduce((total, code) => {
        const batch = BATCH_OPTIONS.find(b => b.code === code);
        return total + (batch ? batch.capacity : 0);
    }, 0);
};

// --- HELPER COMPONENTS (FacultyAssign & StudentBatchSelector) ---
// These are copied from AcademicsPage.jsx
const StudentBatchSelector = ({ course, handleBatchToggle, isEditing, toggleEditing }) => {
    const selectedBatches = course.studentBatches || [];
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (isEditing && dropdownRef.current && !dropdownRef.current.contains(event.target)) { toggleEditing(); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing, toggleEditing]);

    return (
        <div className="batch-selector" style={{ position: 'relative' }}>
            {!isEditing && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                    {selectedBatches.map(batchCode => (
                        <span key={batchCode} className="tag" style={{ background: '#e0eafc', color: '#333', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                            {batchCode}
                            <FaTimes size={12} color="#333" style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => handleBatchToggle(course.id, batchCode)} />
                        </span>
                    ))}
                    <FaPlus size={14} color="#007bff" style={{ cursor: 'pointer', marginLeft: '5px' }} title="Add Batch" onClick={() => toggleEditing()} />
                </div>
            )}
            {isEditing && (
                <div ref={dropdownRef} className="batch-dropdown" style={{ position: 'absolute', background: 'white', border: '1px solid #ddd', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '10px', zIndex: 100, width: '250px', left: 0 }}>
                    <button onClick={toggleEditing} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                    {BATCH_OPTIONS.map(batch => (
                        <div key={batch.code} style={{ display: 'flex', alignItems: 'center', padding: '8px 5px' }}>
                            <input type="checkbox" id={`${course.id}-${batch.code}`} checked={selectedBatches.includes(batch.code)} onChange={() => handleBatchToggle(course.id, batch.code)} style={{ marginRight: '10px' }} />
                            <label htmlFor={`${course.id}-${batch.code}`}>{batch.name} ({batch.capacity})</label>
                        </div>
                    ))}
                </div>
            )}
            <div style={{ fontWeight: 'bold', marginTop: '5px', textAlign: 'center' }}>
                Total: {calculateTotalStudents(selectedBatches)}
            </div>
        </div>
    );
};
const FacultyAssign = ({ course, faculties, handleFacultyAssignmentChange, isEditing, toggleEditing }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (isEditing && dropdownRef.current && !dropdownRef.current.contains(event.target)) { toggleEditing(); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing, toggleEditing]);
    const assignedEmails = course.facultyAssignments.map(a => a.facultyEmail);
    const filteredFaculties = faculties.filter(f => (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.email.toLowerCase().includes(searchQuery.toLowerCase())) && !assignedEmails.includes(f.email));
    return (
        <div ref={dropdownRef} className="faculty-assignment-container" style={{ position: 'relative', minWidth: '250px' }}>
            {!isEditing && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                    {course.facultyAssignments.map(assignment => {
                        const faculty = faculties.find(f => f.email === assignment.facultyEmail);
                        const name = faculty ? faculty.name : assignment.facultyEmail.split('@')[0];
                        return (
                            <span key={assignment.facultyEmail} className="tag" style={{ background: assignment.isCoordinator ? '#007bff' : '#e0eafc', color: assignment.isCoordinator ? '#fff' : '#333', padding: '3px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', fontWeight: assignment.isCoordinator ? 'bold' : 'normal' }}>
                                {name}{assignment.isCoordinator && ' (C)'}
                                <FaTimes size={12} color={assignment.isCoordinator ? '#fff' : '#333'} style={{ marginLeft: '5px', cursor: 'pointer' }} onClick={() => handleFacultyAssignmentChange(course.id, assignment.facultyEmail, null, 'REMOVE')} />
                            </span>
                        )
                    })}
                    <FaPlus size={14} color="#007bff" style={{ cursor: 'pointer', marginLeft: '5px' }} title="Add Faculty" onClick={() => toggleEditing()} />
                </div>
            )}
            {isEditing && (
                <div className="faculty-dropdown" style={{ position: 'absolute', background: 'white', border: '1px solid #ddd', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '4px', padding: '10px', zIndex: 100, width: '300px', left: 0 }}>
                    <button onClick={toggleEditing} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Assign Faculty</div>
                    {course.facultyAssignments.map(assignment => {
                        const faculty = faculties.find(f => f.email === assignment.facultyEmail);
                        const name = faculty ? faculty.name : assignment.facultyEmail.split('@')[0];
                        return (
                            <div key={assignment.facultyEmail} style={{ display: 'flex', alignItems: 'center', padding: '3px' }}>
                                <input type="radio" name={`coord-${course.id}`} checked={assignment.isCoordinator} onChange={() => handleFacultyAssignmentChange(course.id, assignment.facultyEmail, true, 'TOGGLE_COORDINATOR')} title="Set as Coordinator" style={{ marginRight: '5px' }} />
                                <span style={{ fontWeight: assignment.isCoordinator ? 'bold' : 'normal' }}>{name}</span>
                            </div>
                        );
                    })}
                    <hr style={{ margin: '10px 0' }} />
                    <div style={{ marginTop: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
                            <input type="text" placeholder="Search & add faculty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ border: 'none', padding: '5px', width: '100%' }} />
                            <FaSearch style={{ padding: '5px', color: '#777' }} />
                        </div>
                        {searchQuery && (
                            <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', borderTop: 'none', background: '#fdfdfd' }}>
                                {filteredFaculties.length > 0 ? filteredFaculties.map(faculty => (
                                    <div key={faculty.email} onClick={() => { handleFacultyAssignmentChange(course.id, faculty.email, false, 'ADD'); setSearchQuery(''); }} style={{ padding: '8px 10px', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f0f0f0' }} className="faculty-search-item" >
                                        {faculty.name}
                                    </div>
                                )) : <div style={{padding: '5px', color: '#888'}}>No results</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- YOUR ORIGINAL HODPAGE COMPONENT ---
const HODPage = ({ user, onLogout, documents, updateDocuments }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editingData, setEditingData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [faculties, setFaculties] = useState([]); // State for faculty list

  // Load faculty data on component mount
  useEffect(() => {
    // TODO: Load faculty from a central source, not dummy data
    const savedFaculties = localStorage.getItem('faculties');
    if (savedFaculties && JSON.parse(savedFaculties).length > 0) {
        setFaculties(JSON.parse(savedFaculties));
    } else {
        setFaculties(DUMMY_FACULTY_DATA);
    }
  }, []);

  // When a document is selected, copy its data to the editable state
  useEffect(() => {
    if (selectedDocument) {
      // Ensure 'data' exists and is an array
      const docData = selectedDocument.data || [];
      // Ensure all courses in the doc have .id, .facultyAssignments, and .studentBatches
      const formattedData = docData.map(course => ({
          ...course,
          id: course.id || course._id, // Use 'id' or '_id'
          facultyAssignments: course.facultyAssignments || [],
          studentBatches: course.studentBatches || []
      }));
      setEditingData(formattedData);
    }
  }, [selectedDocument]);

  // --- THIS IS THE KEY ---
  // Filter documents to ONLY show ones matching the HOD's department
  const myDocuments = documents.filter(doc => doc.department === user.department);
  const pendingDocuments = myDocuments.filter(doc => doc.status === 'pending');
  const completedDocuments = myDocuments.filter(doc => doc.status === 'completed');

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    setActiveTab('edit');
  };

  const handleBackToDocuments = () => {
    setSelectedDocument(null);
    setEditingData([]);
    setActiveTab('documents');
  };

  // --- MODIFIED HANDLERS ---
  // These functions update the LOCAL 'editingData' state.
  // They do NOT call the database.

  const handleFacultyAssignmentChange = (courseId, facultyEmail, isCoordinator, action) => {
    setEditingData(prevData => {
        return prevData.map(course => {
            if (course.id !== courseId) return course;

            let newAssignments = [...course.facultyAssignments];
            if (action === 'TOGGLE_COORDINATOR') {
                newAssignments = newAssignments.map(a => a.facultyEmail === facultyEmail ? { ...a, isCoordinator: true } : { ...a, isCoordinator: false });
            } else if (action === 'ADD' && facultyEmail && !newAssignments.some(a => a.facultyEmail === facultyEmail)) {
                newAssignments.push({ facultyEmail, isCoordinator: false });
            } else if (action === 'REMOVE') {
                newAssignments = newAssignments.fsilter(a => a.facultyEmail !== facultyEmail);
            }
            return { ...course, facultyAssignments: newAssignments };
        });
    });
  };

  const handleBatchToggle = (courseId, batchCode) => {
    setEditingData(prevData => {
        return prevData.map(course => {
            if (course.id !== courseId) return course;

            const currentBatches = course.studentBatches || [];
            let newBatches;
            if (currentBatches.includes(batchCode)) {
                newBatches = currentBatches.filter(code => code !== batchCode);
            } else {
                newBatches = [...currentBatches, batchCode];
            }
            return { ...course, studentBatches: newBatches };
        });
    });
  };

  // This function updates the simple text fields
  const handleCellEdit = (id, field, value) => {
    setEditingData(editingData.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    ));
    setEditingCell(null); // Close the input box
  };

  // --- YOUR ORIGINAL SUBMIT FUNCTION ---
  // This is now 100% correct. It saves the 'editingData' (which now
  // includes faculty and batch info) back to the main 'documents' list.
  const handleSubmitDocument = () => {
    if (!selectedDocument) return;

    const updatedDocument = {
      ...selectedDocument,
      data: editingData, // Save all the HOD's edits
      status: 'completed',
      completedAt: new Date().toLocaleString(),
      completedBy: user.email
    };

    const updatedDocuments = documents.map(doc => 
      doc.id === selectedDocument.id ? updatedDocument : doc
    );

    updateDocuments(updatedDocuments); // Save back to App.js/localStorage
    setSelectedDocument(null);
    setEditingData([]);
    setActiveTab('documents');
    
    alert('Document submitted successfully!');
  };

  const getIncompleteFields = (data) => {
    // This function might need updating to check new fields
    let incompleteCount = 0;
    data.forEach(course => {
        if (!course.facultyAssignments || course.facultyAssignments.length === 0) incompleteCount++;
        if (!course.studentBatches || course.studentBatches.length === 0) incompleteCount++;
    });
    return incompleteCount;
  };

  return (
    <div className="hod-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>HOD Dashboard ({user.department})</h1>
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
              <div className="stat-number">{myDocuments.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <div className="stat-number">
                {myDocuments.length > 0 ? Math.round((completedDocuments.length / myDocuments.length) * 100) : 0}%
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
            <h2>Received Documents (My Department)</h2>
            
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

        {/* --- THIS IS THE UPDATED EDIT TAB --- */}
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
                 {/* ... (your original document-meta div) ... */}
              </div>

              <div className="edit-instructions">
                <div className="alert alert-info">
                  <strong>Instructions:</strong> Please fill in the missing Faculty and Batch details for your department.
                </div>
              </div>

              <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <table className="table edit-table" style={{ minWidth: '1600px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>Code</th>
                      <th style={{ width: '15%' }}>Course Name</th>
                      <th style={{ width: '8%' }}>L-T-P-C</th>
                      <th style={{ width: '5%' }}>Sem</th>
                      <th style={{ width: '32%' }}>Faculty</th>
                      <th style={{ width: '32%' }}>Students (Batches / Total)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingData.map(course => (
                      <tr key={course.id}>
                        <td>
                            {/* Course Code (Read-only) */}
                            <span className="read-only-cell">{course.CCODE || 'N/A'}</span>
                        </td>
                        <td>
                            {/* Course Name (Read-only) */}
                            <span className="read-only-cell">{course.courseName || 'N/A'}</span>
                        </td>
                        <td>
                            {/* L-T-P-C (Read-only) */}
                            <span className="read-only-cell">{`${course.L}-${course.T}-${course.P}-${course.credits}`}</span>
                        </td>
                        <td>
                            {/* Semester (Read-only) */}
                            <span className="read-only-cell">{course.semester || 'N/A'}</span>
                        </td>
                        <td>
                            {/* --- NEW FACULTY EDITOR --- */}
                            <FacultyAssign 
                                course={course} 
                                faculties={faculties} 
                                handleFacultyAssignmentChange={handleFacultyAssignmentChange}
                                isEditing={editingCell === `${course.id}-faculty`}
                                toggleEditing={() => setEditingCell(editingCell === `${course.id}-faculty` ? null : `${course.id}-faculty`)}
                            />
                        </td>
                        <td>
                            {/* --- NEW BATCH EDITOR --- */}
                            <StudentBatchSelector 
                                course={course} 
                                handleBatchToggle={handleBatchToggle} 
                                calculateTotalStudents={calculateTotalStudents}
                                isEditing={editingCell === `${course.id}-batches`}
                                toggleEditing={() => setEditingCell(editingCell === `${course.id}-batches` ? null : `${course.id}-batches`)}
                            />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Your original History tab - no changes */}
        {activeTab === 'history' && (
            <div className="tab-content fade-in">
                <h2>Document History</h2>
                {completedDocuments.length > 0 ? (
                    <div className="document-section">
                        <h3>Completed</h3>
                        <div className="documents-grid">
                            {completedDocuments.map(doc => (
                                <div key={doc.id} className="document-card completed-card">
                                    <div className="document-header">
                                        <h4>{doc.title}</h4>
                                        <span className="status-badge status-completed">Completed</span>
                                    </div>
                                    <div className="document-info">
                                        <p><strong>Sent by:</strong> {doc.sentBy}</p>
                                        <p><strong>Completed:</strong> {doc.completedAt}</p>
                                        <p><strong>Completed by:</strong> {doc.completedBy}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No completed documents found.</p>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
};

export default HODPage;