const api_url = process.env.REACT_APP_API_URL;

const getAllOrders = async ({ search = '', status = '', limit = 20, offset = 0 } = {}, token) => {
  const params = new URLSearchParams({ search, limit, offset });
  if (status !== '') params.set('status', status);
  return fetch(`${api_url}/api/orders?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });
};

const getOrderById = async (id, token) =>
  fetch(`${api_url}/api/order/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

const createOrder = async (formData, token) =>
  fetch(`${api_url}/api/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const updateOrder = async (formData, token) =>
  fetch(`${api_url}/api/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const updateOrderStatus = async (id, order_status, token) =>
  fetch(`${api_url}/api/order/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify({ order_status }),
  });

const updateOrderService = async (id, service_id, service_completed, token) =>
  fetch(`${api_url}/api/order/${id}/service`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify({ service_id, service_completed }),
  });

const orderService = {
  getAllOrders, getOrderById, createOrder, updateOrder,
  updateOrderStatus, updateOrderService,
};
export default orderService;
