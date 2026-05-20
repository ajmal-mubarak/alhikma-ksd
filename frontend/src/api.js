import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';
const getToken = () => localStorage.getItem('admin_token');
const authHeaders = (isMultipart = false) => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
  },
});

export const api = {
  getResult: (registerNumber) =>
    axios.get(`${API_BASE}/result/`, { params: { register_number: registerNumber } }),

  adminLogin: (username, password) =>
    axios.post(`${API_BASE}/admin-login/`, { username, password }),

  getStudents: (search = '') =>
    axios.get(`${API_BASE}/students/`, { ...authHeaders(), params: { search } }),

  createStudent: (formData) =>
    axios.post(`${API_BASE}/students/`, formData, authHeaders(true)),

  updateStudent: (id, formData) =>
    axios.put(`${API_BASE}/students/${id}/`, formData, authHeaders(true)),

  deleteStudent: (id) =>
    axios.delete(`${API_BASE}/students/${id}/`, authHeaders()),

  updateStatus: (id, status) =>
    axios.patch(`${API_BASE}/students/${id}/status/`, { status }, authHeaders()),
};
