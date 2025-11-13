import { useState, useEffect, useRef } from 'react';
import './HODPage.css';
import { FaPlus, FaTimes, FaSearch } from "react-icons/fa";
import { updateCourse } from '../../api';
import { toast } from "react-toastify";

const DUMMY_FACULTY_DATA = [
  { id: 1678880000001, name: "Dr. Aisha Sharma", designation: "Dr.", firstName: "Aisha", middleName: "", lastName: "Sharma", employeeId: "F001", email: "aisha@lnmiit.ac.in", department: "Computer Science and Engineering", addedAt: "2025-11-10, 8:00:00 PM", addedBy: "admin@lnmiit.ac.in" },
  { id: 1678880000002, name: "Prof. Vikram Singh", designation: "Prof.", firstName: "Vikram", middleName: "", lastName: "Singh", employeeId: "F002", email: "vikram@lnmiit.ac.in", department: "Electronics and Communication Engineering", addedAt: "2025-11-10, 8:01:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000003, name: "Dr. Ramesh Gupta", designation: "Dr.", firstName: "Ramesh", middleName: "", lastName: "Gupta", employeeId: "F003", email: "ramesh@lnmiit.ac.in", department: "Physics", addedAt: "2025-11-10, 8:02:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000004, name: "Prof. Sania Khan", designation: "Prof.", firstName: "Sania", middleName: "", lastName: "Khan", employeeId: "F004", email: "sania@lnmiit.ac.in", department: "Mathematics", addedAt: "2025-11-10, 8:03:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000005, name: "Dr. Priya Jain", designation: "Dr.", firstName: "Priya", middleName: "", lastName: "Jain", employeeId: "F005", email: "priya@lnmiit.ac.in", department: "Humanities and Social Sciences", addedAt: "2025-11-10, 8:04:00 PM", "addedBy": "admin@lnmiit.ac.in" }
];

const BATCH_OPTIONS = [
  { name: 'CSE-A', code: 'CSE-A', capacity: 120 },
  { name: 'CSE-B', code: 'CSE-B', capacity: 120 },
  { name: 'CCE', code: 'CCE', capacity: 120 },
  { name: 'ECE', code: 'ECE', capacity: 120 },
  { name: 'ME', code: 'ME', capacity: 120 },
];

const StudentBatchSelector = ({ course, handleBatchToggle, calculateTotalStudents, isEditing, toggleEditing }) => {
  const selectedBatches = course.studentBatches || [];
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditing && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleEditing();
      }
    };
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
              <FaTimes size={12} color="#333" style={{ marginLeft: '5px', cursor: 'pointer' }}
                onClick={() => handleBatchToggle(course.id, batchCode)}
              />
            </span>
          ))}
          <FaPlus size={14} color="#007bff" style={{ cursor: 'pointer', marginLeft: '5px' }}
            title="Add Batch"
            onClick={() => toggleEditing()}
          />
        </div>
      )}
      
      {isEditing && (
        <div ref={dropdownRef} className="batch-dropdown" style={{ 
          position: 'absolute', background: 'white', border: '1px solid #ddd',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '4px', 
          padding: '10px', zIndex: 9999, width: '250px', left: 0, top: '100%'
        }}>
          <button onClick={toggleEditing} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
          {BATCH_OPTIONS.map(batch => (
            <div key={batch.code} style={{ display: 'flex', alignItems: 'center', padding: '8px 5px' }}>
              <input
                type="checkbox"
                id={`${course.id}-${batch.code}`}
                checked={selectedBatches.includes(batch.code)}
                onChange={() => handleBatchToggle(course.id, batch.code)}
                style={{ marginRight: '10px' }}
              />
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
    const handleClickOutside = (event) => {
      if (isEditing && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleEditing();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, toggleEditing]);
  
  const assignedEmails = course.facultyAssignments.map(a => a.facultyEmail);

  const filteredFaculties = faculties.filter(f => 
    (f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     f.email.toLowerCase().includes(searchQuery.toLowerCase())) && 
    !assignedEmails.includes(f.email)
  );

  return (
    <div ref={dropdownRef} className="faculty-assignment-container" style={{ position: 'relative', minWidth: '250px' }}>
      {!isEditing && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
          {course.facultyAssignments.map(assignment => {
            const faculty = faculties.find(f => f.email === assignment.facultyEmail);
            const name = faculty ? faculty.name : assignment.facultyEmail.split('@')[0];
            return (
              <span 
                key={assignment.facultyEmail} 
                className="tag" 
                style={{ 
                  background: assignment.isCoordinator ? '#007bff' : '#e0eafc', 
                  color: assignment.isCoordinator ? '#fff' : '#333', 
                  padding: '3px 8px', borderRadius: '12px', 
                  display: 'flex', alignItems: 'center',
                  fontWeight: assignment.isCoordinator ? 'bold' : 'normal'
                }}
              >
                {name}
                {assignment.isCoordinator && ' (C)'}
                <FaTimes 
                  size={12} 
                  color={assignment.isCoordinator ? '#fff' : '#333'} 
                  style={{ marginLeft: '5px', cursor: 'pointer' }}
                  onClick={() => handleFacultyAssignmentChange(course.id, assignment.facultyEmail, null, 'REMOVE')}
                />
              </span>
            )
          })}
          <FaPlus 
            size={14} 
            color="#007bff" 
            style={{ cursor: 'pointer', marginLeft: '5px' }}
            title="Add Faculty"
            onClick={() => toggleEditing()}
          />
        </div>
      )}

      {isEditing && (
        <div className="faculty-dropdown" style={{
          position: 'absolute', background: 'white', border: '1px solid #ddd',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '4px', 
          padding: '10px', zIndex: 9999, width: '300px', left: 0, top: '100%',
          maxHeight: '400px', overflowY: 'auto'
        }}>
          <button onClick={toggleEditing} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Assign Faculty</div>
          
          {course.facultyAssignments.map(assignment => {
            const faculty = faculties.find(f => f.email === assignment.facultyEmail);
            const name = faculty ? faculty.name : assignment.facultyEmail.split('@')[0];
            return (
              <div key={assignment.facultyEmail} style={{ display: 'flex', alignItems: 'center', padding: '3px' }}>
                <input
                  type="radio"
                  name={`coord-${course.id}`}
                  checked={assignment.isCoordinator}
                  onChange={() => 
                    handleFacultyAssignmentChange(course.id, assignment.facultyEmail, true, 'TOGGLE_COORDINATOR')
                  }
                  title="Set as Coordinator"
                  style={{ marginRight: '5px' }}
                />
                <span style={{ fontWeight: assignment.isCoordinator ? 'bold' : 'normal' }}>
                  {name}
                </span>
              </div>
            );
          })}
          <hr style={{ margin: '10px 0' }} />
          
          <div style={{ marginTop: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px' }}>
              <input
                type="text"
                placeholder="Search & add faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', padding: '5px', width: '100%' }}
              />
              <FaSearch style={{ padding: '5px', color: '#777' }} />
            </div>
            
            {searchQuery && (
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', borderTop: 'none', background: '#fdfdfd' }}>
                {filteredFaculties.length > 0 ? filteredFaculties.map(faculty => (
                  <div 
                    key={faculty.email}
                    onClick={() => {
                      handleFacultyAssignmentChange(course.id, faculty.email, false, 'ADD');
                      setSearchQuery(''); 
                    }}
                    style={{ 
                      padding: '8px 10px', 
                      cursor: 'pointer', 
                      textAlign: 'left', 
                      borderBottom: '1px solid #f0f0f0' 
                    }}
                    className="faculty-search-item"
                  >
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

const HODPage = ({ user, onLogout, documents, updateDocuments }) => {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [editingData, setEditingData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    const savedFaculties = localStorage.getItem('faculties');
    if (savedFaculties && JSON.parse(savedFaculties).length > 0) {
      setFaculties(JSON.parse(savedFaculties));
    } else {
      setFaculties(DUMMY_FACULTY_DATA);
    }
  }, []);

  useEffect(() => {
    if (selectedDocument) {
      // Filter courses by HOD's department
      const departmentCourses = selectedDocument.data.filter(course => 
        course.deptCode === user.department || course.department === user.department
      );
      setEditingData(departmentCourses);
    }
  }, [selectedDocument, user.department]);

  // Filter documents by HOD's department
  const filteredDocuments = documents.filter(doc => {
    if (!doc.data || doc.data.length === 0) return false;
    // Check if document contains courses from HOD's department
    return doc.data.some(course => course.deptCode === user.department || course.department === user.department);
  });

  const pendingDocuments = filteredDocuments.filter(doc => doc.status === 'pending');
  const completedDocuments = filteredDocuments.filter(doc => doc.status === 'completed');

  const calculateTotalStudents = (batchCodes) => {
    return batchCodes.reduce((total, code) => {
      const batch = BATCH_OPTIONS.find(b => b.code === code);
      return total + (batch ? batch.capacity : 0);
    }, 0);
  };

  const handleFacultyAssignmentChange = (courseId, facultyEmail, isCoordinator, action) => {
    const updatedData = editingData.map(course => {
      if (course.id !== courseId) return course;

      let newAssignments = [...(course.facultyAssignments || [])];

      if (action === 'TOGGLE_COORDINATOR') {
        newAssignments = newAssignments.map(a => 
          a.facultyEmail === facultyEmail 
          ? { ...a, isCoordinator: true } 
          : { ...a, isCoordinator: false } 
        );
      } else if (action === 'ADD' && facultyEmail && !newAssignments.some(a => a.facultyEmail === facultyEmail)) {
        newAssignments.push({ facultyEmail, isCoordinator: false });
      } else if (action === 'REMOVE') {
        newAssignments = newAssignments.filter(a => a.facultyEmail !== facultyEmail);
      }
      
      return { ...course, facultyAssignments: newAssignments };
    });
    
    setEditingData(updatedData);
  };

  const handleBatchToggle = (courseId, batchCode) => {
    const updatedData = editingData.map(course => {
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

    setEditingData(updatedData);
  };

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    // Filter courses by HOD's department
    const departmentCourses = doc.data.filter(course => 
      course.deptCode === user.department || course.department === user.department
    );
    setEditingData(departmentCourses);
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

  const handleSubmitDocument = async () => {
    if (!selectedDocument) return;

    // Validate that all courses have faculty and batches assigned
    const incompleteCourses = editingData.filter(course => 
      !course.facultyAssignments || 
      course.facultyAssignments.length === 0 || 
      !course.studentBatches || 
      course.studentBatches.length === 0
    );

    if (incompleteCourses.length > 0) {
      toast.error(`Please assign faculty and batches to all courses. ${incompleteCourses.length} course(s) incomplete.`);
      return;
    }

    try {
      // Save each course to database
      const updatePromises = editingData.map(course => 
        updateCourse(course.id, {
          facultyAssignments: course.facultyAssignments,
          studentBatches: course.studentBatches
        })
      );

      await Promise.all(updatePromises);

      // Update document status
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
      
      toast.success('Document submitted successfully! All changes saved to database. 🎉');
    } catch (error) {
      toast.error('Failed to submit document. Please try again.');
      console.error('Submit error:', error);
    }
  };

  const getIncompleteCourses = (data) => {
    return data.filter(course => 
      !course.facultyAssignments || 
      course.facultyAssignments.length === 0 || 
      !course.studentBatches || 
      course.studentBatches.length === 0
    ).length;
  };

  return (
    <div className="hod-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>HOD Dashboard</h1>
            <div className="header-info">
              <span className="user-info">Welcome, {user.name} ({user.department})</span>
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
              <div className="stat-number">{filteredDocuments.length}</div>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <div className="stat-number">
                {filteredDocuments.length > 0 ? Math.round((completedDocuments.length / filteredDocuments.length) * 100) : 0}%
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
            <h2>Received Documents (Your Department: {user.department})</h2>
            
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
                        <p><strong>Courses:</strong> {doc.data.filter(c => c.deptCode === user.department || c.department === user.department).length}</p>
                        <p><strong>Incomplete courses:</strong> {getIncompleteCourses(doc.data.filter(c => c.deptCode === user.department || c.department === user.department))}</p>
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
                  <strong>Instructions:</strong> Assign faculty and student batches to each course. 
                  Click the + icon to add faculty or batches. Course details are read-only.
                </div>
              </div>

              <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <table className="table edit-table" style={{ minWidth: '1500px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '6%' }}>Dept</th>
                      <th style={{ width: '8%' }}>Course Code</th>
                      <th style={{ width: '15%' }}>Course Name</th>
                      <th style={{ width: '5%' }}>Type</th>
                      <th style={{ width: '8%' }}>L-T-P-C</th>
                      <th style={{ width: '5%' }}>Sem</th>
                      <th style={{ width: '25%' }}>Faculty</th>
                      <th style={{ width: '25%' }}>Students (Batches)</th>
                      <th style={{ width: '8%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingData.map(course => {
                      const isComplete = 
                        course.facultyAssignments && 
                        course.facultyAssignments.length > 0 && 
                        course.studentBatches && 
                        course.studentBatches.length > 0;
                      
                      return (
                        <tr key={course.id} className={!isComplete ? 'incomplete-row' : ''}>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {course.deptCode || course.department}
                          </td>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {course.CCODE}
                          </td>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {course.courseName}
                          </td>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {course.type}
                          </td>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {`${course.L}-${course.T}-${course.P}-${course.credits}`}
                          </td>
                          <td style={{ background: '#f9fafb', color: '#6b7280' }}>
                            {course.semester}
                          </td>
                          <td>
                            <FacultyAssign 
                              course={course} 
                              faculties={faculties} 
                              handleFacultyAssignmentChange={handleFacultyAssignmentChange}
                              isEditing={editingCell === `${course.id}-faculty`}
                              toggleEditing={() => setEditingCell(editingCell === `${course.id}-faculty` ? null : `${course.id}-faculty`)}
                            />
                          </td>
                          <td>
                            <StudentBatchSelector 
                              course={course} 
                              handleBatchToggle={handleBatchToggle} 
                              calculateTotalStudents={calculateTotalStudents}
                              isEditing={editingCell === `${course.id}-batches`}
                              toggleEditing={() => setEditingCell(editingCell === `${course.id}-batches` ? null : `${course.id}-batches`)}
                            />
                          </td>
                          <td>
                            {isComplete ? (
                              <span className="status-badge status-complete">Complete</span>
                            ) : (
                              <span className="status-badge status-incomplete">Incomplete</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
              {filteredDocuments.length === 0 ? (
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
                    {filteredDocuments.map(doc => (
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
                        <td>{doc.data.filter(c => c.deptCode === user.department || c.department === user.department).length}</td>
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
