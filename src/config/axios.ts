import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // change if needed
  withCredentials: true, // useful if you use cookies later
});

export default api
