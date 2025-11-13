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

// ✅ Configuration API functions

// Batches
export const getBatches = () => API.get("/configurations/batches");
export const createBatch = (batch) => API.post("/configurations/batches", batch);
export const updateBatch = (id, batch) => API.put(`/configurations/batches/${id}`, batch);
export const deleteBatch = (id) => API.delete(`/configurations/batches/${id}`);

// Rooms
export const getRooms = () => API.get("/configurations/rooms");
export const createRoom = (room) => API.post("/configurations/rooms", room);
export const updateRoom = (id, room) => API.put(`/configurations/rooms/${id}`, room);
export const deleteRoom = (id) => API.delete(`/configurations/rooms/${id}`);

// Slots
export const getSlots = () => API.get("/configurations/slots");
export const createSlot = (slot) => API.post("/configurations/slots", slot);
export const updateSlot = (id, slot) => API.put(`/configurations/slots/${id}`, slot);
export const deleteSlot = (id) => API.delete(`/configurations/slots/${id}`);