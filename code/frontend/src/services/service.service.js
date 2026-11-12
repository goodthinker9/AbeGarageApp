const api_url = process.env.REACT_APP_API_URL;

/** GET /api/services — public, active only */
const getActiveServices = async () => {
  const response = await fetch(`${api_url}/api/services`);
  return response;
};

/** GET /api/services/all — staff, includes inactive */
const getAllServices = async (token) => {
  const response = await fetch(`${api_url}/api/services/all`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });
  return response;
};

/** GET /api/service/:id — staff */
const getServiceById = async (id, token) => {
  const response = await fetch(`${api_url}/api/service/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });
  return response;
};

/** POST /api/service — staff */
const createService = async (formData, token) => {
  const response = await fetch(`${api_url}/api/service`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });
  return response;
};

/** PUT /api/service — staff */
const updateService = async (formData, token) => {
  const response = await fetch(`${api_url}/api/service`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });
  return response;
};

const serviceService = {
  getActiveServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
};
export default serviceService;
