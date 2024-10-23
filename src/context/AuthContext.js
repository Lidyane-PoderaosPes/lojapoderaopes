import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Importar auth do Firebase

// Cria o contexto de autenticação
export const AuthContext = createContext();

// Provedor do AuthContext
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(); // Inicializa o Auth

  // Monitorar o estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
