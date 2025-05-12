import axiosInstance from "./AxiosConfig";

const ENDPOINT = "/shifts";

class ShiftService {
  getAllShifts() {
    return axiosInstance.get(ENDPOINT);
  }

  getShiftById(id) {
    return axiosInstance.get(`${ENDPOINT}/${id}`);
  }

  createShift(data) {
    return axiosInstance.post(ENDPOINT, data);
  }

  updateShift(id, data) {
    return axiosInstance.put(`${ENDPOINT}/${id}`, data);
  }

  deleteShift(id) {
    return axiosInstance.delete(`${ENDPOINT}/${id}`);
  }
}

const shiftServiceInstance = new ShiftService();
export default shiftServiceInstance;
