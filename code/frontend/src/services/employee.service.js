const api_url = process.env.REACT_APP_API_URL;

const createEmployee = async (formData, token) =>
  fetch(`${api_url}/api/employee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const getAllEmployees = async (token) =>
  fetch(`${api_url}/api/employees`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

const getEmployeeById = async (id, token) =>
  fetch(`${api_url}/api/employee/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
  });

const updateEmployee = async (formData, token) =>
  fetch(`${api_url}/api/employee`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-access-token': token },
    body: JSON.stringify(formData),
  });

const employeeService = { createEmployee, getAllEmployees, getEmployeeById, updateEmployee };
export default employeeService;
