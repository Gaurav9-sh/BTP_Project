import { useState, useEffect } from 'react';
import './AcademicsPage.css';
import { useCourses } from '../Context/CourseContext';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import axios from 'axios';
import { toast } from "react-toastify";

const AcademicsPage = ({ user, onLogout, documents, updateDocuments }) => {
  const [activeTab, setActiveTab] = useState('departments');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [centralData, setCentralData] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [newFaculty, setNewFaculty] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
  const { getCoursesByDepartment, loading, error } = useCourses();
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingCourseData, setEditingCourseData] = useState(null);

  const [newCourse, setNewCourse] = useState({
    CCODE: "",
    courseName: "",
    type: "",
    L: 0,
    T: 0,
    P: 0,
    credits: 0,
    semester: "",
    department: "",
  });

  console.log("CSE Data from backend in academics page", getCoursesByDepartment('CSE'))
  const departments = [
    { id: 'cse', name: 'Computer Science and Engineering', code: 'CSE' },
    { id: 'cce', name: 'Communication and Computer Engineering', code: 'CCE' },
    { id: 'ece', name: 'Electronics and Communication Engineering', code: ' ECE' },
    { id: 'mme', name: 'Mechanical-Mechatronics Engineering', code: 'MME' },
    { id: 'physics', name: 'Physics', code: 'phy' },
    { id: 'hsc', name: 'Humanities and Social Sciences', code: 'HSC' },
  ];

  const sampleCourses = {
    cse: getCoursesByDepartment('CSE'),
    cce: getCoursesByDepartment('CSE'),
    ece: getCoursesByDepartment('ECE'),
    mme: getCoursesByDepartment('MME'),
    physics: getCoursesByDepartment('PHY'),
    humanities: getCoursesByDepartment('HSC')
  };

  useEffect(() => {

    const allCourses = [];
    departments.forEach(dept => {
      const deptCourses = sampleCourses[dept.id] || [];
      deptCourses.forEach(course => {
        allCourses.push({
          ...course,
          department: dept.name,
          deptCode: dept.code
        });
      });
    });
    setCentralData(allCourses);

    // Load faculties from localStorage
    const savedFaculties = localStorage.getItem('faculties');
    if (savedFaculties) {
      setFaculties(JSON.parse(savedFaculties));
    }
  }, []);

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setCourses(sampleCourses[dept.id] || []);
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
    setCourses([]);
  };
  const handleUpdate = async (id, updatedCourse) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/courses/${id}`, updatedCourse);

      // Update local state
      setCourses((prev) =>
        prev.map((course) => (course._id === id ? res.data : course))
      );

      setEditingCourse(null);
      toast.success("Course updated successfully ✅");
    } catch (err) {
      toast.error("Error updating course ❌");
    }
  };

  // ✅ Delete course
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);

      // Update local state
      setCourses((prev) => prev.filter((course) => course._id !== id));

      toast.success("Course deleted successfully 🗑️");
    } catch (err) {
      toast.error("Error deleting course ❌");
    }
  };

  // ✅ Add new course
  const handleAdd = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/courses", newCourse);

      // Update local state
      setCourses((prev) => [...prev, res.data]);

      setNewCourse({
        CCODE: "",
        courseName: "",
        type: "",
        L: 0,
        T: 0,
        P: 0,
        credits: 0,
        semester: "",
        department: "",
      });

      toast.success("New course added 🎉");
    } catch (err) {
      toast.error("Error adding course ❌");
    }
  };

  const handleAddRow = () => {
    if (Object.keys(newRow).length === 0) return;

    const newCourse = {
      id: Date.now(),
      ccode: newRow.code || '',
      name: newRow.name || '',
      credits: parseInt(newRow.credits) || 0,
      semester: newRow.semester || '',
      professor: newRow.professor || '',
      department: newRow.department || '',
      deptCode: newRow.deptCode || ''
    };

    setCentralData([...centralData, newCourse]);
    setNewRow({});
  };

  const handleDeleteRow = (id) => {
    setCentralData(centralData.filter(course => course.id !== id));
  };

  const handleCellEdit = (id, field, value) => {
    setCentralData(centralData.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    ));
    setEditingCell(null);
  };

  const handleSendToHODs = () => {
    const newDocument = {
      id: Date.now(),
      title: 'Course Schedule Document',
      data: centralData,
      status: 'pending',
      sentAt: new Date().toLocaleString(),
      sentBy: user.email
    };

    updateDocuments([...documents, newDocument]);
    alert('Document sent to HODs successfully!');
  };

  const handleAddFaculty = () => {
    if (!newFaculty.name || !newFaculty.email || !newFaculty.department || !newFaculty.password) {
      alert('Please fill in all fields');
      return;
    }

    // Validate email domain
    if (!newFaculty.email.endsWith('@lnmiit.ac.in')) {
      alert('Email must end with @lnmiit.ac.in');
      return;
    }

    // Check if email already exists
    if (faculties.some(faculty => faculty.email === newFaculty.email)) {
      alert('Faculty with this email already exists');
      return;
    }

    const faculty = {
      id: Date.now(),
      name: newFaculty.name,
      email: newFaculty.email,
      department: newFaculty.department,
      password: newFaculty.password,
      addedAt: new Date().toLocaleString(),
      addedBy: user.email
    };

    const updatedFaculties = [...faculties, faculty];
    setFaculties(updatedFaculties);
    localStorage.setItem('faculties', JSON.stringify(updatedFaculties));

    setNewFaculty({});
    setShowAddFacultyForm(false);
    alert('Faculty added successfully!');
  };

  const handleDeleteFaculty = (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      const updatedFaculties = faculties.filter(faculty => faculty.id !== id);
      setFaculties(updatedFaculties);
      localStorage.setItem('faculties', JSON.stringify(updatedFaculties));
      alert('Faculty deleted successfully!');
    }
  };

  const getStatusCount = (status) => {
    return documents.filter(doc => doc.status === status).length;
  };

  return (
    <div className="academics-page">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1>Academics Dashboard</h1>
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
              <h3>Total Courses</h3>
              <div className="stat-number">{centralData.length}</div>
            </div>
            <div className="stat-card">
              <h3>Total Faculties</h3>
              <div className="stat-number">{faculties.length}</div>
            </div>
            <div className="stat-card">
              <h3>Pending Documents</h3>
              <div className="stat-number">{getStatusCount('pending')}</div>
            </div>
            <div className="stat-card">
              <h3>Total Departments</h3>
              <div className="stat-number">{departments.length}</div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            Department Management
          </button>
          <button
            className={`tab ${activeTab === 'central' ? 'active' : ''}`}
            onClick={() => setActiveTab('central')}
          >
            Central Management
          </button>
          <button
            className={`tab ${activeTab === 'faculties' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculties')}
          >
            Faculty Management
          </button>
          <button
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Document Status
          </button>
        </div>

        {activeTab === 'departments' && (
          <div className="tab-content fade-in">
            {!selectedDepartment ? (
              <div>
                <h2>Department List</h2>
                <div className="departments-grid">
                  {departments.map(dept => (
                    <div
                      key={dept.id}
                      className="department-card"
                      onClick={() => handleDepartmentClick(dept)}
                    >
                      <div className="dept-code">{dept.code}</div>
                      <div className="dept-name">{dept.name}</div>
                      <div className="dept-courses">
                        {(sampleCourses[dept.id] || []).length} courses
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="breadcrumb">
                  <button onClick={handleBackToDepartments} className="btn btn-secondary">
                    ← Back to Departments
                  </button>
                  <h2>{selectedDepartment.name} Courses</h2>
                </div>

                {/* Group and sort courses by semester */}
                {Object.entries(
                  courses.reduce((acc, course) => {
                    if (!acc[course.semester]) acc[course.semester] = [];
                    acc[course.semester].push(course);
                    return acc;
                  }, {})
                )
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([semester, semesterCourses]) => (
                    <div key={semester} className="card semester-card">
                      {/* Semester Heading */}
                      <h3 className="semester-heading">Semester {semester}</h3>

                      {/* Course Table */}
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Type</th>
                            <th>L</th>
                            <th>T</th>
                            <th>P</th>
                            <th>Credits</th>
                            <th>Semester</th>
                            <th>Department</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semesterCourses.map((course) => (
                            <tr key={course._id}>
                              {editingCourse === course._id ? (
                                <>
                                  <td>
                                    <input
                                      value={editingCourseData.CCODE}
                                      onChange={(e) =>
                                        setEditingCourseData({
                                          ...editingCourseData,
                                          CCODE: e.target.value,
                                        })
                                      }
                                    />

                                  </td>
                                  <td>
                                    <input
                                      value={course.courseName}
                                      onChange={(e) =>
                                        setCourses((prev) =>
                                          prev.map((c) =>
                                            c._id === course._id
                                              ? { ...c, courseName: e.target.value }
                                              : c
                                          )
                                        )
                                      }
                                    />
                                  </td>
                                  <td>
                                    <input
                                      value={course.type}
                                      onChange={(e) =>
                                        setCourses((prev) =>
                                          prev.map((c) =>
                                            c._id === course._id ? { ...c, type: e.target.value } : c
                                          )
                                        )
                                      }
                                    />
                                  </td>
                                  <td><input value={course.L} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, L: e.target.value } : c))} /></td>
                                  <td><input value={course.T} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, T: e.target.value } : c))} /></td>
                                  <td><input value={course.P} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, P: e.target.value } : c))} /></td>
                                  <td><input value={course.credits} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, credits: e.target.value } : c))} /></td>
                                  <td><input value={course.semester} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, semester: e.target.value } : c))} /></td>
                                  <td><input value={course.department} onChange={(e) => setCourses(prev => prev.map(c => c._id === course._id ? { ...c, department: e.target.value } : c))} /></td>
                                  <td>
                                    <FaSave
                                      color='green'
                                      className="icon save-icon"
                                      size={22}
                                      onClick={() => handleUpdate(course._id, course)}
                                    />
                                    <FaTimes
                                      color='#DE3163'
                                      className="icon cancel-icon"
                                      size={22}
                                      onClick={() => setEditingCourse(null)}
                                    />
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td>{course.CCODE}</td>
                                  <td>{course.courseName}</td>
                                  <td>{course.type}</td>
                                  <td>{course.L}</td>
                                  <td>{course.T}</td>
                                  <td>{course.P}</td>
                                  <td>{course.credits}</td>
                                  <td>{course.semester}</td>
                                  <td>{course.department}</td>
                                  <td>
                                    <FaEdit
                                      color='#6495ED'
                                      className="icon edit-icon"
                                      size={22}
                                      onClick={() => setEditingCourse(course._id)}
                                    />
                                    <FaTrash
                                      color='#DE3163'
                                      size={22}
                                      className="icon delete-icon"
                                      onClick={() => handleDelete(course._id)}
                                    />
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}

                          {/* Add new course row */}
                          <tr>
                            <td><input value={newCourse.CCODE} onChange={(e) => setNewCourse({ ...newCourse, CCODE: e.target.value })} /></td>
                            <td><input value={newCourse.courseName} onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })} /></td>
                            <td><input value={newCourse.type} onChange={(e) => setNewCourse({ ...newCourse, type: e.target.value })} /></td>
                            <td><input value={newCourse.L} onChange={(e) => setNewCourse({ ...newCourse, L: e.target.value })} /></td>
                            <td><input value={newCourse.T} onChange={(e) => setNewCourse({ ...newCourse, T: e.target.value })} /></td>
                            <td><input value={newCourse.P} onChange={(e) => setNewCourse({ ...newCourse, P: e.target.value })} /></td>
                            <td><input value={newCourse.credits} onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })} /></td>
                            <td><input value={newCourse.semester} onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })} /></td>
                            <td><input value={newCourse.department} onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })} /></td>
                            {/* <FaPlus color='green' size={22} className="icon add-icon" id='add-icon1' onClick={handleAdd} /> */}
                            <button onClick={handleAdd} id='add-icon1' >Add</button>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'central' && (
          <div className="tab-content fade-in">
            <div className="central-header">
              <h2>Central Course Management</h2>
              <button onClick={handleSendToHODs} className="btn btn-primary">
                Send to HODs
              </button>
            </div>

            <div className="card">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                      <th>Semester</th>
                      <th>Professor</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {centralData.map(course => (
                      <tr key={course.id}>
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
                            <span onClick={() => setEditingCell(`${course.id}-department`)}>
                              {course.department}
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
                            <span onClick={() => setEditingCell(`${course.id}-code`)}>
                              {course.code}
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
                            <span onClick={() => setEditingCell(`${course.id}-name`)}>
                              {course.name}
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
                            <span onClick={() => setEditingCell(`${course.id}-credits`)}>
                              {course.credits}
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
                            <span onClick={() => setEditingCell(`${course.id}-semester`)}>
                              {course.semester}
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
                            <span onClick={() => setEditingCell(`${course.id}-professor`)}>
                              {course.professor}
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteRow(course.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="add-row">
                      <td>
                        <input
                          type="text"
                          placeholder="Department"
                          value={newRow.department || ''}
                          onChange={(e) => setNewRow({ ...newRow, department: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Course Code"
                          value={newRow.code || ''}
                          onChange={(e) => setNewRow({ ...newRow, code: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Course Name"
                          value={newRow.name || ''}
                          onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="Credits"
                          value={newRow.credits || ''}
                          onChange={(e) => setNewRow({ ...newRow, credits: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Semester"
                          value={newRow.semester || ''}
                          onChange={(e) => setNewRow({ ...newRow, semester: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Professor"
                          value={newRow.professor || ''}
                          onChange={(e) => setNewRow({ ...newRow, professor: e.target.value })}
                        />
                      </td>
                      <td>
                        <button onClick={handleAddRow} className="btn btn-success btn-sm">
                          Add
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faculties' && (
          <div className="tab-content fade-in">
            <div className="central-header">
              <h2>Faculty Management</h2>
              <button
                onClick={() => setShowAddFacultyForm(!showAddFacultyForm)}
                className="btn btn-primary"
              >
                {showAddFacultyForm ? 'Cancel' : 'Add Faculty'}
              </button>
            </div>

            {showAddFacultyForm && (
              <div className="card faculty-form">
                <h3>Add New Faculty</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Faculty Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter faculty name"
                      value={newFaculty.name || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="faculty@lnmiit.ac.in"
                      value={newFaculty.email || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-input"
                      value={newFaculty.department || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter password"
                      value={newFaculty.password || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button onClick={handleAddFaculty} className="btn btn-success">
                    Add Faculty
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFacultyForm(false);
                      setNewFaculty({});
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="card">
              {faculties.length === 0 ? (
                <div className="empty-state">
                  <p>No faculty members added yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Added Date</th>
                        <th>Added By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {faculties.map(faculty => (
                        <tr key={faculty.id}>
                          <td>{faculty.name}</td>
                          <td>{faculty.email}</td>
                          <td>{faculty.department}</td>
                          <td>{faculty.addedAt}</td>
                          <td>{faculty.addedBy}</td>
                          <td>
                            <button
                              onClick={() => handleDeleteFaculty(faculty.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="tab-content fade-in">
            <h2>Document Status</h2>
            <div className="card">
              {documents.length === 0 ? (
                <div className="empty-state">
                  <p>No documents sent yet.</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Sent At</th>
                      <th>Status</th>
                      <th>Courses Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map(doc => (
                      <tr key={doc.id}>
                        <td>{doc.title}</td>
                        <td>{doc.sentAt}</td>
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

export default AcademicsPage;