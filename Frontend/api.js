import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// ✅ Get all courses (optionally filter by department)
export const getCourses = (department = null) => {
  if (department) {
    return API.get(`/courses?department=${department}`);
  }
  return API.get("/courses");
};
