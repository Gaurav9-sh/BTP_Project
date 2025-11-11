import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCourses } from "../../api"; // This is your api.js, which is now fixed!

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
        const { data } = await getCourses(); // This is working!
        console.log("✅ Courses fetched:", data);
        setCourses(data);
        setError(null); // This clears any old errors
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching courses:", err);
        setError(err);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []); // Empty array means this runs only ONCE. This is correct.
 
  // --- THIS IS THE FIX ---
  // We wrap this function in useCallback.
  // It will no longer be re-created on every render.
  // This will stop the infinite loop in AcademicsPage.jsx.
  const getCoursesByDepartment = useCallback((departmentCode) => {
    console.log("Filtering for department:", departmentCode);
    if (!departmentCode) return courses;
    return courses.filter((course) => course.department === departmentCode);
  }, [courses]); // The function only updates if the 'courses' array changes.

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