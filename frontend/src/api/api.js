import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// attach token
API.interceptors.request.use((config) => {
  const user = localStorage.getItem("userInfo");
  if (user) {
    const token = JSON.parse(user).token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

export const createMood = (data) => API.post("/moods", data);
export const getMoods = () => API.get("/moods");
export const deleteMood = (id) => API.delete(`/moods/${id}`);
