const api_url = process.env.REACT_APP_API_URL;

/** GET /api/customers?search=&limit=&offset= */
const getAllCustomers = async ({ search = '', limit = 20, offset = 0 } = {}, token) => {
  const params = new URLSearchParams({ search, limit, offset });
  return fetch(`${api_url}/api/customers?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });
};

/** GET /api/customer/:id */
const getCustomerById = async (id, token) =>
  fetch(`${api_url}/api/customer/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

/** POST /api/customer */
const createCustomer = async (formData, token) =>
  fetch(`${api_url}/api/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

/** PUT /api/customer */
const updateCustomer = async (formData, token) =>
  fetch(`${api_url}/api/customer`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const customerService = { getAllCustomers, getCustomerById, createCustomer, updateCustomer };
export default customerService;
