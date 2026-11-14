const api_url = process.env.REACT_APP_API_URL;

/** GET /api/public/order/:hash — no token required */
const getPublicOrder = async (hash) =>
  fetch(`${api_url}/api/public/order/${hash}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

const publicOrderService = { getPublicOrder };
export default publicOrderService;
