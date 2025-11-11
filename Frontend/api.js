import axios from "axios";

// ✅ Read API base URL from .env (Frontend/.env must contain VITE_API_BASE)
const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// ✅ Axios instance
const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// ✅ Get courses (optionally by department)
export const getCourses = (department = null) => {
  if (department) {
    return API.get(`/courses?department=${department}`);
  }
  return API.get("/courses");
};

// ✅ CRUD functions
export const updateCourse = (id, updatedData) => API.put(`/courses/${id}`, updatedData);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const createCourse = (newCourse) => API.post("/courses", newCourse);
