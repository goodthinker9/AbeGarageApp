/**
 * Read the logged-in employee from localStorage and decode the JWT payload.
 * Returns {} if nothing is stored, the token is malformed, or the token has
 * expired — and clears the stale entry in the last case.
 */
const getAuth = async () => {
  const employee = JSON.parse(localStorage.getItem('employee') || 'null');
  if (!employee || !employee.employee_token) return {};

  try {
    const decoded = decodeTokenPayload(employee.employee_token);

    // Check expiry (exp is Unix seconds)
    if (decoded.exp && Date.now() / 1000 > decoded.exp) {
      localStorage.removeItem('employee');
      return {};
    }

    employee.employee_role       = decoded.employee_role;
    employee.employee_id         = decoded.employee_id;
    employee.employee_first_name = decoded.employee_first_name;
    return employee;
  } catch {
    // Malformed token
    localStorage.removeItem('employee');
    return {};
  }
};

/**
 * Decode the payload section of a JWT without verifying the signature.
 * Verification happens on the server; this is used only for UI state.
 */
const decodeTokenPayload = (token) => {
  const base64Url = token.split('.')[1];
  const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
  return JSON.parse(jsonPayload);
};

export default getAuth;
