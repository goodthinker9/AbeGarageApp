const api_url = process.env.REACT_APP_API_URL;

// Send a POST request to create a new employee
const createEmployee = async (formData, loggedInEmployeeToken) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': loggedInEmployeeToken,
    },
    body: JSON.stringify(formData),
  };
  const response = await fetch(`${api_url}/api/employee`, requestOptions);
  return response;
};

// Send a GET request to retrieve all employees
const getAllEmployees = async (token) => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': token,
    },
  };
  const response = await fetch(`${api_url}/api/employees`, requestOptions);
  return response;
};

const employeeService = { createEmployee, getAllEmployees };
export default employeeService;
