const api_url = process.env.REACT_APP_API_URL;

/** GET /api/vehicles/:customer_id */
const getVehiclesByCustomer = async (customer_id, token) =>
  fetch(`${api_url}/api/vehicles/${customer_id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

/** GET /api/vehicle/:id */
const getVehicleById = async (id, token) =>
  fetch(`${api_url}/api/vehicle/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

/** POST /api/vehicle */
const createVehicle = async (formData, token) =>
  fetch(`${api_url}/api/vehicle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

/** PUT /api/vehicle */
const updateVehicle = async (formData, token) =>
  fetch(`${api_url}/api/vehicle`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const vehicleService = { getVehiclesByCustomer, getVehicleById, createVehicle, updateVehicle };
export default vehicleService;
