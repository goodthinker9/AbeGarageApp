/**
 * Thin wrapper around a fetch call that handles 401 uniformly:
 * clear localStorage and redirect to /login.
 *
 * Returns { data, error } where data is the parsed JSON on success.
 */
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

function useApiRequest() {
  const navigate = useNavigate();

  const request = useCallback(
    async (fetchPromise) => {
      try {
        const res = await fetchPromise;
        if (res.status === 401) {
          localStorage.removeItem('employee');
          navigate('/login');
          return { data: null, error: 'Session expired. Please log in again.' };
        }
        const json = await res.json();
        if (!res.ok) {
          return { data: null, error: json.message || `Server error: ${res.status}`, json };
        }
        return { data: json, error: null };
      } catch (err) {
        return { data: null, error: 'A network error occurred. Please try again.' };
      }
    },
    [navigate],
  );

  return request;
}

export default useApiRequest;
