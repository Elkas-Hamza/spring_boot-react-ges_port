import axios from "axios";

const API_URL = "http://localhost:8080/api/shifts";

class ShiftService {
  getAllShifts() {
    return axios.get(API_URL);
  }

  getShiftById(id) {
    return axios.get(`${API_URL}/${id}`);
  }

  createShift(data) {
    return axios.post(API_URL, data);
  }

  updateShift(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  }

  deleteShift(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
}

const shiftServiceInstance = new ShiftService();

export default shiftServiceInstance; 