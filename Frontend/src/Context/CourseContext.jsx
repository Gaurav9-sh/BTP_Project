import React, { createContext, useContext, useEffect, useState } from "react";
import { getCourses } from "../../api"; // axios helper we wrote earlier

// Create context
const CoursesContext = createContext();

// Provider component
export const CoursesProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all courses once when app starts
  useEffect(() => {
  const fetchCourses = async () => {
    try {
      console.log("🔍 Attempting to fetch courses...");
      setLoading(true);
      const { data } = await getCourses();
      console.log("✅ Courses fetched:", data);
      setCourses(data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      setError(err);
      setLoading(false);
    }
  };
  fetchCourses();
}, []);
//  console.log('All courses from backend:',courses)
 
  const getCoursesByDepartment = (departmentCode) => {
    console.log("Department code",departmentCode)
    if (!departmentCode) return courses;
    return courses.filter((course) => course.department === departmentCode);
  };

  return (
    <CoursesContext.Provider value={{ courses, loading, error, getCoursesByDepartment }}>
      {children}
    </CoursesContext.Provider>
  );
};

// Hook for easy usage
export const useCourses = () => {
  return useContext(CoursesContext);
};
