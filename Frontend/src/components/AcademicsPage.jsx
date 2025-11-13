import { useState, useEffect, useRef } from 'react';
import './AcademicsPage.css';
import { useCourses } from '../Context/CourseContext';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import { updateCourse, deleteCourse, createCourse, getBatches, getSlots } from '../../api';
import { toast } from "react-toastify";
import ConfigurationsPage from './ConfigurationsPage';

// --- GLOBAL CONSTANTS ---

const DUMMY_FACULTY_DATA = [
  { id: 1678880000001, name: "Dr. Aisha Sharma", designation: "Dr.", firstName: "Aisha", middleName: "", lastName: "Sharma", employeeId: "F001", email: "aisha@lnmiit.ac.in", department: "Computer Science and Engineering", addedAt: "2025-11-10, 8:00:00 PM", addedBy: "admin@lnmiit.ac.in" },
  { id: 1678880000002, name: "Prof. Vikram Singh", designation: "Prof.", firstName: "Vikram", middleName: "", lastName: "Singh", employeeId: "F002", email: "vikram@lnmiit.ac.in", department: "Electronics and Communication Engineering", addedAt: "2025-11-10, 8:01:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000003, name: "Dr. Ramesh Gupta", designation: "Dr.", firstName: "Ramesh", middleName: "", lastName: "Gupta", employeeId: "F003", email: "ramesh@lnmiit.ac.in", department: "Physics", addedAt: "2025-11-10, 8:02:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000004, name: "Prof. Sania Khan", designation: "Prof.", firstName: "Sania", middleName: "", lastName: "Khan", employeeId: "F004", email: "sania@lnmiit.ac.in", department: "Mathematics", addedAt: "2025-11-10, 8:03:00 PM", "addedBy": "admin@lnmiit.ac.in" },
  { id: 1678880000005, name: "Dr. Priya Jain", designation: "Dr.", firstName: "Priya", middleName: "", lastName: "Jain", employeeId: "F005", email: "priya@lnmiit.ac.in", department: "Humanities and Social Sciences", addedAt: "2025-11-10, 8:04:00 PM", "addedBy": "admin@lnmiit.ac.in" }
];

// BATCH_OPTIONS will be loaded from the database dynamically

// --- HELPER COMPONENTS ---

const StudentBatchSelector = ({ course, handleBatchToggle, calculateTotalStudents, isEditing, toggleEditing, batchOptions }) => {
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
                    padding: '10px', zIndex: 100, width: '250px', left: 0 
                }}>
                    <button onClick={toggleEditing} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                    {batchOptions.map(batch => (
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
                    padding: '10px', zIndex: 100, width: '300px', left: 0
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


// --- MAIN COMPONENT ---
const AcademicsPage = ({ user, onLogout, documents, updateDocuments }) => {
    
    // 💡 FIX 1: Initialize activeTab from localStorage to persist on refresh
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'departments');
    
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [courses, setCourses] = useState([]);
    const [centralData, setCentralData] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [newRow, setNewRow] = useState({});
    
    const [newFaculty, setNewFaculty] = useState({
        designation: '', firstName: '', middleName: '', lastName: '',
        employeeId: '', email: '', department: '', unavailableSlots: []
    });
    
    const [slots, setSlots] = useState([]);
    const [editingFacultySlots, setEditingFacultySlots] = useState(null);
    const slotSelectorRef = useRef(null);
    
    const [editingCell, setEditingCell] = useState(null); 
    const [showAddFacultyForm, setShowAddFacultyForm] = useState(false);
    const { getCoursesByDepartment, loading } = useCourses();
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingCourseData, setEditingCourseData] = useState(null); 
    
    const [allSemesters, setAllSemesters] = useState([]); 
    const [selectedSemester, setSelectedSemester] = useState(null); 

    const [newCourse, setNewCourse] = useState({
        CCODE: "", courseName: "", type: "", L: 0, T: 0, P: 0, credits: 0, semester: "",
        department: "", facultyAssignments: [], studentBatches: [], sharingType: 'Horizontal',
    });

    const [batchOptions, setBatchOptions] = useState([]);

    const departments = [
        { id: 'cse', name: 'Computer Science and Engineering', code: 'CSE' },
        { id: 'cce', name: 'Communication and Computer Engineering', code: 'CCE' },
        { id: 'ece', name: 'Electronics and Communication Engineering', code: 'ECE' }, 
        { id: 'mme', name: 'Mechanical-Mechatronics Engineering', code: 'MME' },
        { id: 'physics', name: 'Physics', code: 'PHY' },
        { id: 'hsc', name: 'Humanities and Social Sciences', code: 'HSC' },
        { id: 'math', name: 'Mathematics', code: 'MAT' }, 
    ];
    
    const calculateTotalStudents = (batchCodes) => {
        return batchCodes.reduce((total, code) => {
            const batch = batchOptions.find(b => b.code === code);
            return total + (batch ? batch.capacity : 0);
        }, 0);
    };

    // Fetch batches from the database
    useEffect(() => {
        const loadBatches = async () => {
            try {
                const res = await getBatches();
                const formattedBatches = res.data.map(batch => ({
                    name: batch.batchId,
                    code: batch.batchId,
                    capacity: batch.size
                }));
                setBatchOptions(formattedBatches);
            } catch (err) {
                console.error("Error loading batches:", err);
                toast.error("Failed to load batches");
            }
        };
        loadBatches();
    }, []);

    // Fetch slots from the database
    useEffect(() => {
        const loadSlots = async () => {
            try {
                const res = await getSlots();
                setSlots(res.data);
            } catch (err) {
                console.error("Error loading slots:", err);
            }
        };
        loadSlots();
    }, []);

    // Handle click outside slot selector
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (slotSelectorRef.current && !slotSelectorRef.current.contains(event.target)) {
                setEditingFacultySlots(null);
            }
        };
        if (editingFacultySlots) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingFacultySlots]);

    // This hook runs after loading is complete to build the initial table
    useEffect(() => {
        if (!loading) {
            const allCourses = [];
            const semesters = new Set();

            departments.forEach(dept => {
                const deptCourses = getCoursesByDepartment(dept.code);
                deptCourses.forEach(course => {
                    if (course.semester) semesters.add(course.semester);
                    
                    allCourses.push({
                        ...course,
                        id: course._id,
                        departmentName: dept.name,
                        deptCode: dept.code,
                        facultyAssignments: course.facultyAssignments || [], 
                        studentBatches: course.studentBatches || [],
                        sharingType: course.sharingType || 'Horizontal', 
                    });
                });
            });
            
            setCentralData(allCourses);
            setAllSemesters([...semesters].sort((a, b) => parseInt(a) - parseInt(b)));

            const savedFaculties = localStorage.getItem('faculties');
            if (savedFaculties && JSON.parse(savedFaculties).length > 0) {
                // Ensure all faculties have unavailableSlots field
                const facultiesWithSlots = JSON.parse(savedFaculties).map(f => ({
                    ...f,
                    unavailableSlots: f.unavailableSlots || []
                }));
                setFaculties(facultiesWithSlots);
                localStorage.setItem('faculties', JSON.stringify(facultiesWithSlots));
            } else {
                const dummyWithSlots = DUMMY_FACULTY_DATA.map(f => ({
                    ...f,
                    unavailableSlots: []
                }));
                setFaculties(dummyWithSlots);
                localStorage.setItem('faculties', JSON.stringify(dummyWithSlots));
            }
        }
    }, [loading, getCoursesByDepartment]); 
    
    // 💡 FIX 1 (Continued): Save activeTab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    
    const filteredCentralData = selectedSemester
        ? selectedSemester === 'ODD'
            ? centralData.filter(course => [1, 3, 5, 7].includes(course.semester))
            : selectedSemester === 'EVEN'
                ? centralData.filter(course => [2, 4, 6, 8].includes(course.semester))
                : centralData.filter(course => String(course.semester) === String(selectedSemester))
        : centralData;

    const handleDepartmentClick = (dept) => {
        setSelectedDepartment(dept);
        setCourses(getCoursesByDepartment(dept.code) || []);
    };

    const handleBackToDepartments = () => {
        setSelectedDepartment(null);
        setCourses([]);
    };

    const startEditCourse = (course) => {
        setEditingCourse(course._id);
        setEditingCourseData({ ...course }); 
    };
    
    const handleEditingCourseChange = (e) => {
        const { name, value } = e.target;
        setEditingCourseData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdate = async (id, updatedCourse) => {
        try {
            const res = await updateCourse(id, updatedCourse);
            setCourses((prev) =>
                prev.map((course) => (course._id === id ? res.data : course))
            );
            setEditingCourse(null);
            setEditingCourseData(null); 
            toast.success("Course updated successfully ✅");
        } catch (err) {
            toast.error("Error updating course ❌");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCourse(id);
            setCourses((prev) => prev.filter((course) => course._id !== id));
            toast.success("Course deleted successfully 🗑️");
        } catch (err) {
            toast.error("Error deleting course ❌");
        }
    };

    const handleAdd = async () => {
        try {
            const res = await createCourse(newCourse);
            setCourses((prev) => [...prev, res.data]);

            setNewCourse({
                CCODE: "", courseName: "", type: "", L: 0, T: 0, P: 0, credits: 0, semester: "",
                department: selectedDepartment ? selectedDepartment.code : "", 
                facultyAssignments: [], studentBatches: [], sharingType: 'Horizontal',
            });
            toast.success("New course added 🎉");
        } catch (err) {
            toast.error("Error adding course ❌");
        }
    };
    
    // 💡 FIX 2: Immediate Database Update for Sharing Type
    const handleCentralDataChange = async (id, field, value) => {
        const originalData = [...centralData];
        // Optimistic Update
        const updatedData = centralData.map(course =>
            course.id === id ? { ...course, [field]: value } : course
        );
        setCentralData(updatedData);
        
        // Persistent Update
        try {
            await updateCourse(id, { [field]: value });
        } catch (err) {
            toast.error(`Failed to save ${field}. Reverting.`);
            setCentralData(originalData);
        }
    };
    
    // 💡 FIX 2: Immediate Database Update for Faculty
    const handleFacultyAssignmentChange = async (courseId, facultyEmail, isCoordinator, action) => {
        const originalData = [...centralData];
        let updatedCourse = null;
        
        const updatedData = centralData.map(course => {
            if (course.id !== courseId) return course;

            let newAssignments = [...course.facultyAssignments];

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
            
            updatedCourse = { ...course, facultyAssignments: newAssignments };
            return updatedCourse;
        });
        
        setCentralData(updatedData);
        
        if (updatedCourse) {
            try {
                await updateCourse(courseId, { facultyAssignments: updatedCourse.facultyAssignments });
            } catch (err) {
                toast.error("Failed to update faculty. Reverting.");
                setCentralData(originalData);
            }
        }
    };

    // 💡 FIX 2: Immediate Database Update for Batches
    const handleBatchToggle = async (courseId, batchCode) => {
        const originalData = [...centralData];
        let updatedCourse = null;
        
        const updatedData = centralData.map(course => {
            if (course.id !== courseId) return course;

            const currentBatches = course.studentBatches || [];
            let newBatches;
            if (currentBatches.includes(batchCode)) {
                newBatches = currentBatches.filter(code => code !== batchCode);
            } else {
                newBatches = [...currentBatches, batchCode];
            }
            updatedCourse = { ...course, studentBatches: newBatches };
            return updatedCourse;
        });

        setCentralData(updatedData);

        if (updatedCourse) {
            try {
                await updateCourse(courseId, { studentBatches: updatedCourse.studentBatches });
            } catch (err) {
                toast.error("Failed to update batches. Reverting.");
                setCentralData(originalData);
            }
        }
    };


    const handleAddRow = () => {
        if (Object.keys(newRow).length === 0) return;
        // Note: Ideally this should call createCourse API directly for persistence
        const newCourseData = {
            id: Date.now(), CCODE: newRow.CCODE || '', courseName: newRow.courseName || '',
            credits: parseInt(newRow.credits) || 0, semester: newRow.semester || '',
            deptCode: newRow.deptCode || '', facultyAssignments: newRow.facultyAssignments || [],
            studentBatches: newRow.studentBatches || [], sharingType: newRow.sharingType || 'Horizontal',
            L: parseInt(newRow.L) || 0, T: parseInt(newRow.T) || 0, 
            P: parseInt(newRow.P) || 0, type: newRow.type || 'Core',
        };
        setCentralData([...centralData, newCourseData]);
        setNewRow({});
    };

    const handleDeleteRow = (id) => {
        setCentralData(centralData.filter(course => course.id !== id));
    };

    const handleSendToHODs = () => {
        const timestamp = new Date().toLocaleString('en-US', { 
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        }); 
        
        let semesterTitle = "All Semesters";
        if (selectedSemester === 'ODD') {
            semesterTitle = "Odd Semesters (1, 3, 5, 7)";
        } else if (selectedSemester === 'EVEN') {
            semesterTitle = "Even Semesters (2, 4, 6, 8)";
        } else if (selectedSemester) {
            semesterTitle = `Semester ${selectedSemester}`;
        }

        const newDocument = {
            id: Date.now(), 
            title: `Course Schedule (${semesterTitle}) - ${timestamp}`, 
            data: filteredCentralData,
            status: 'pending', 
            sentAt: timestamp, 
            sentBy: user.email
        };

        updateDocuments([...documents, newDocument]);
        toast.success('Document sent to HODs successfully!');
    };

    const handleAddFaculty = () => {
        if (!newFaculty.designation || !newFaculty.firstName || !newFaculty.lastName || !newFaculty.employeeId || !newFaculty.email || !newFaculty.department) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (!newFaculty.email.endsWith('@lnmiit.ac.in')) {
            toast.error('Email must end with @lnmiit.ac.in');
            return;
        }

        if (faculties.some(faculty => faculty.email === newFaculty.email)) {
            toast.error('Faculty with this email already exists');
            return;
        }

        const fullName = [newFaculty.designation, newFaculty.firstName, newFaculty.middleName, newFaculty.lastName].filter(Boolean).join(' ');

        const faculty = {
            id: Date.now(),
            name: fullName,
            designation: newFaculty.designation,
            firstName: newFaculty.firstName,
            middleName: newFaculty.middleName,
            lastName: newFaculty.lastName,
            employeeId: newFaculty.employeeId,
            email: newFaculty.email,
            department: newFaculty.department,
            unavailableSlots: newFaculty.unavailableSlots || [],
            addedAt: new Date().toLocaleString(),
            addedBy: user.email
        };

        const updatedFaculties = [...faculties, faculty];
        setFaculties(updatedFaculties);
        localStorage.setItem('faculties', JSON.stringify(updatedFaculties));

        setNewFaculty({ 
            designation: '', firstName: '', middleName: '', lastName: '',
            employeeId: '', email: '', department: '', unavailableSlots: []
        }); 
        setShowAddFacultyForm(false);
        toast.success('Faculty added successfully!');
    };

    const handleDeleteDocument = (id) => {
        if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
            const updatedDocuments = documents.filter(doc => doc.id !== id);
            updateDocuments(updatedDocuments); 
            toast.success('Document deleted successfully 🗑️');
        }
    };

    const handleDeleteFaculty = (id) => {
        if (window.confirm('Are you sure you want to delete this faculty member?')) {
            const updatedFaculties = faculties.filter(faculty => faculty.id !== id);
            setFaculties(updatedFaculties);
            localStorage.setItem('faculties', JSON.stringify(updatedFaculties));
            toast.success('Faculty deleted successfully!');
        }
    };

    const handleUpdateFacultySlots = (facultyId, slotIds) => {
        const updatedFaculties = faculties.map(faculty => 
            faculty.id === facultyId 
                ? { ...faculty, unavailableSlots: slotIds }
                : faculty
        );
        setFaculties(updatedFaculties);
        localStorage.setItem('faculties', JSON.stringify(updatedFaculties));
        setEditingFacultySlots(null);
        toast.success('Unavailable slots updated successfully!');
    };

    const handleToggleSlot = (facultyId, slotId) => {
        const faculty = faculties.find(f => f.id === facultyId);
        if (!faculty) return;
        
        const currentSlots = faculty.unavailableSlots || [];
        const newSlots = currentSlots.includes(slotId)
            ? currentSlots.filter(id => id !== slotId)
            : [...currentSlots, slotId];
        
        handleUpdateFacultySlots(facultyId, newSlots);
    };

    const getStatusCount = (status) => {
        return documents.filter(doc => doc.status === status).length;
    };

    // --- RENDER START ---
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
                    <button
                        className={`tab ${activeTab === 'configurations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('configurations')}
                    >
                        Configurations
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
                                                {(getCoursesByDepartment(dept.code) || []).length} courses
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
                                            <h3 className="semester-heading">Semester {semester}</h3>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Course Code</th> <th>Course Name</th>
                                                        <th>Type</th> <th>L</th> <th>T</th> <th>P</th>
                                                        <th>Credits</th> <th>Semester</th> <th>Department</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {semesterCourses.map((course) => (
                                                        <tr key={course._id}>
                                                            {editingCourse === course._id && editingCourseData ? ( 
                                                                <>
                                                                    <td><input name="CCODE" value={editingCourseData.CCODE} onChange={handleEditingCourseChange} /></td>
                                                                    <td><input name="courseName" value={editingCourseData.courseName} onChange={handleEditingCourseChange} /></td>
                                                                    <td><input name="type" value={editingCourseData.type} onChange={handleEditingCourseChange} /></td>
                                                                    <td><input name="L" value={editingCourseData.L} onChange={handleEditingCourseChange} type="number" /></td>
                                                                    <td><input name="T" value={editingCourseData.T} onChange={handleEditingCourseChange} type="number"/></td>
                                                                    <td><input name="P" value={editingCourseData.P} onChange={handleEditingCourseChange} type="number" /></td>
                                                                    <td><input name="credits" value={editingCourseData.credits} onChange={handleEditingCourseChange} type="number"/></td>
                                                                    <td><input name="semester" value={editingCourseData.semester} onChange={handleEditingCourseChange} /></td>
                                                                    <td><input name="department" value={editingCourseData.department} onChange={handleEditingCourseChange} /></td>
                                                                    <td>
                                                                        <FaSave color='green' className="icon save-icon" size={22} onClick={() => handleUpdate(course._id, editingCourseData)} />
                                                                        <FaTimes color='#DE3163' className="icon cancel-icon" size={22} onClick={() => {setEditingCourse(null); setEditingCourseData(null);}} />
                                                                    </td>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <td>{course.CCODE}</td> <td>{course.courseName}</td>
                                                                    <td>{course.type}</td> <td>{course.L}</td> <td>{course.T}</td> <td>{course.P}</td>
                                                                    <td>{course.credits}</td> <td>{course.semester}</td> <td>{course.department}</td>
                                                                    <td>
                                                                        <FaEdit color='#6495ED' className="icon edit-icon" size={22} onClick={() => startEditCourse(course)} />
                                                                        <FaTrash color='#DE3163' size={22} className="icon delete-icon" onClick={() => handleDelete(course._id)} />
                                                                    </td>
                                                                </>
                                                            )}
                                                        </tr>
                                                    ))}
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
                        <div className="central-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Central Course Management</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <select
                                    id="semester-select"
                                    className="form-input"
                                    value={selectedSemester || ''}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    style={{ padding: '8px', minWidth: '180px', background: '#fff', color: '#000' }}
                                >
                                    <option value="">All Semesters</option>
                                    <option value="ODD">Odd Semesters (1, 3, 5, 7)</option>
                                    <option value="EVEN">Even Semesters (2, 4, 6, 8)</option>
                                </select>
                                <button onClick={() => toast.info("Generate Timetable clicked!")} className="btn btn-secondary">
                                    Generate Timetable
                                </button>
                                <button onClick={handleSendToHODs} className="btn btn-primary">
                                    Send to HODs
                                </button>
                            </div>
                        </div>

                        <div className="card">
                            <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                                <table className="table" style={{ minWidth: '2000px' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ width: '6%' }}>Dept</th>
                                            <th style={{ width: '8%' }}>Code</th>
                                            <th style={{ width: '15%' }}>Course Name</th>
                                            <th style={{ width: '5%' }}>Type</th>
                                            <th style={{ width: '8%' }}>L-T-P-C</th>
                                            <th style={{ width: '5%' }}>Sem</th>
                                            <th style={{ width: '20%' }}>Faculty</th>
                                            <th style={{ width: '20%' }}>Students (Batches / Total)</th>
                                            <th style={{ width: '8%' }}>Sharing Type</th> 
                                            <th style={{ width: '5%' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCentralData.map(course => (
                                            <tr key={course.id}>
                                                <td>{course.deptCode}</td>
                                                <td>{course.CCODE}</td>
                                                <td>{course.courseName}</td>
                                                <td>{course.type}</td>
                                                <td>{`${course.L}-${course.T}-${course.P}-${course.credits}`}</td>
                                                <td>{course.semester}</td>

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
                                                        batchOptions={batchOptions}
                                                    />
                                                </td>
                                                
                                                <td>
                                                    <select
                                                        value={course.sharingType}
                                                        onChange={(e) => handleCentralDataChange(course.id, 'sharingType', e.target.value)}
                                                        className="form-input"
                                                        style={{ padding: '8px', minWidth: '120px' }}
                                                    >
                                                        <option value="Horizontal">Horizontal</option>
                                                        <option value="Vertical">Vertical</option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteRow(course.id)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        
                                        <tr className="add-row">
                                            {/* ... Add row content ... */}
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
                                        <label className="form-label">Designation</label>
                                        <select
                                            className="form-input"
                                            value={newFaculty.designation || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Dr.">Dr.</option>
                                            <option value="Prof.">Prof.</option>
                                            <option value="Mr.">Mr.</option>
                                            <option value="Mrs.">Mrs.</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter first name"
                                            value={newFaculty.firstName || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, firstName: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Middle Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="(Optional)"
                                            value={newFaculty.middleName || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, middleName: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter last name"
                                            value={newFaculty.lastName || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, lastName: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Employee ID</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter Employee ID"
                                            value={newFaculty.employeeId || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, employeeId: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
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
                                            style={{ background: '#fff', color: '#000' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-input"
                                            value={newFaculty.department || ''}
                                            onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                                            style={{ background: '#fff', color: '#000' }}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.name}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Unavailable Time Slots (Optional)</label>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                                            gap: '8px',
                                            marginTop: '8px',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '12px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            background: '#f9fafb'
                                        }}>
                                            {slots.map(slot => (
                                                <label key={slot._id} style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    padding: '4px'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={newFaculty.unavailableSlots?.includes(slot.slotId) || false}
                                                        onChange={(e) => {
                                                            const current = newFaculty.unavailableSlots || [];
                                                            const updated = e.target.checked
                                                                ? [...current, slot.slotId]
                                                                : current.filter(id => id !== slot.slotId);
                                                            setNewFaculty({ ...newFaculty, unavailableSlots: updated });
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '13px' }}>
                                                        {slot.slotId} ({slot.startTime}-{slot.endTime})
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button onClick={handleAddFaculty} className="btn btn-success">
                                        Add Faculty
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddFacultyForm(false);
                                            setNewFaculty({ 
                                                designation: '', firstName: '', middleName: '', lastName: '',
                                                employeeId: '', email: '', department: '' 
                                            }); 
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="card">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th> 
                                            <th>Employee ID</th> 
                                            <th>Email</th> 
                                            <th>Department</th>
                                            <th>Unavailable Slots</th>
                                            <th>Added Date</th> 
                                            <th>Added By</th> 
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faculties.map(faculty => (
                                            <tr key={faculty.id}>
                                                <td>{faculty.name}</td> 
                                                <td>{faculty.employeeId}</td> 
                                                <td>{faculty.email}</td> 
                                                <td>{faculty.department}</td>
                                                <td>
                                                    {editingFacultySlots === faculty.id ? (
                                                        <div ref={slotSelectorRef} style={{ position: 'relative' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                flexWrap: 'wrap', 
                                                                gap: '4px', 
                                                                marginBottom: '8px',
                                                                maxWidth: '300px'
                                                            }}>
                                                                {(faculty.unavailableSlots || []).map(slotId => (
                                                                    <span key={slotId} style={{ 
                                                                        background: '#fee2e2', 
                                                                        color: '#991b1b', 
                                                                        padding: '2px 6px', 
                                                                        borderRadius: '8px', 
                                                                        fontSize: '12px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px'
                                                                    }}>
                                                                        {slotId}
                                                                        <FaTimes 
                                                                            size={10} 
                                                                            style={{ cursor: 'pointer' }}
                                                                            onClick={() => handleToggleSlot(faculty.id, slotId)}
                                                                        />
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div style={{ 
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: 0,
                                                                background: 'white',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '8px',
                                                                padding: '12px',
                                                                zIndex: 1000,
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                                maxHeight: '300px',
                                                                overflowY: 'auto',
                                                                minWidth: '250px',
                                                                marginTop: '4px'
                                                            }}>
                                                                <div style={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    <strong style={{ fontSize: '14px' }}>Select Unavailable Slots</strong>
                                                                    <button 
                                                                        onClick={() => setEditingFacultySlots(null)}
                                                                        style={{ 
                                                                            border: 'none', 
                                                                            background: 'none', 
                                                                            cursor: 'pointer',
                                                                            fontSize: '18px',
                                                                            color: '#666'
                                                                        }}
                                                                    >
                                                                        &times;
                                                                    </button>
                                                                </div>
                                                                <div style={{ 
                                                                    display: 'grid', 
                                                                    gridTemplateColumns: 'repeat(2, 1fr)', 
                                                                    gap: '6px'
                                                                }}>
                                                                    {slots.map(slot => (
                                                                        <label key={slot._id} style={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            gap: '6px',
                                                                            cursor: 'pointer',
                                                                            padding: '4px',
                                                                            fontSize: '12px'
                                                                        }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(faculty.unavailableSlots || []).includes(slot.slotId)}
                                                                                onChange={() => handleToggleSlot(faculty.id, slot.slotId)}
                                                                            />
                                                                            <span>
                                                                                {slot.slotId}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                                            {(faculty.unavailableSlots || []).length > 0 ? (
                                                                <>
                                                                    {(faculty.unavailableSlots || []).slice(0, 3).map(slotId => (
                                                                        <span key={slotId} style={{ 
                                                                            background: '#fee2e2', 
                                                                            color: '#991b1b', 
                                                                            padding: '2px 6px', 
                                                                            borderRadius: '8px', 
                                                                            fontSize: '11px'
                                                                        }}>
                                                                            {slotId}
                                                                        </span>
                                                                    ))}
                                                                    {(faculty.unavailableSlots || []).length > 3 && (
                                                                        <span style={{ fontSize: '11px', color: '#666' }}>
                                                                            +{(faculty.unavailableSlots || []).length - 3} more
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span style={{ color: '#9ca3af', fontSize: '13px' }}>None</span>
                                                            )}
                                                            <FaEdit 
                                                                size={12} 
                                                                color="#6495ED" 
                                                                style={{ cursor: 'pointer', marginLeft: '6px' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingFacultySlots(editingFacultySlots === faculty.id ? null : faculty.id);
                                                                }}
                                                                title="Edit unavailable slots"
                                                            />
                                                        </div>
                                                    )}
                                                </td>
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
                                            <th>Course Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map(doc => (
                                            <tr key={doc.id}>
                                                <td>{doc.title}</td> 
                                                <td>{doc.sentAt}</td> 
                                                <td><span className={`status-badge status-${doc.status}`}>{doc.status}</span></td>
                                                <td>{doc.data.length}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'configurations' && (
                    <div className="tab-content fade-in">
                        <ConfigurationsPage />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AcademicsPage;