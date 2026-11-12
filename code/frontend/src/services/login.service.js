const api_url = process.env.REACT_APP_API_URL;

// Send login credentials to the server
const logIn = async (formData) => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  };
  const response = await fetch(`${api_url}/api/employee/login`, requestOptions);
  return response;
};

// Remove the employee record from local storage
const logOut = () => {
  localStorage.removeItem('employee');
};

export default { logIn, logOut };
