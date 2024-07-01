
// utils/jwtUtils.js


export const decodeJWT = () => {
    try {

      const token = sessionStorage.getItem('authToken');

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = JSON.parse(atob(base64));
      return decodedPayload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  