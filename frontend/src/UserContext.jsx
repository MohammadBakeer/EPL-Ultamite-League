// Update your UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [viewId, setViewId] = useState(() => sessionStorage.getItem('viewId') || null);

  useEffect(() => {
    sessionStorage.setItem('viewId', viewId);
  }, [viewId]);

  return (
    <UserContext.Provider value={{ userId, setUserId, viewId, setViewId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
