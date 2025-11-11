import axios from "axios";

// ✅ Read API base URL from .env
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ✅ Axios instance
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// --- THIS IS THE FIX ---
// This interceptor catches every request and adds the token
API.interceptors.request.use(
  (config) => {
    // 1. Get the token from localStorage
    const token = localStorage.getItem("token");

    // 2. If the token exists, add it to the 'Authorization' header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 3. Return the modified request
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);
// --- END OF FIX ---


// ✅ Get courses (optionally by department)
// (No change needed here - the interceptor handles it!)
export const getCourses = (department = null) => {
  if (department) {
    return API.get(`/courses?department=${department}`);
  }
  return API.get("/courses");
};

// ✅ CRUD functions
// (No change needed here - the interceptor handles it!)
export const updateCourse = (id, updatedData) => API.put(`/courses/${id}`, updatedData);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const createCourse = (newCourse) => API.post("/courses", newCourse);