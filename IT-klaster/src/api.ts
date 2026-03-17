import axios from "axios";

const API = axios.create({
  baseURL: "https://aloqabankstudents.pythonanywhere.com/api/students/",
});

export default API;
