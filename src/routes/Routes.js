import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes as RouterRoutes, Route } from 'react-router-dom';
import Home from '../page/Home';
import Products from '../components/Products';
import AddProduct from '../components/AddProduct';
import Cart from '../components/Cart';
import Auth from '../components/Auth';
import NotFound from '../components/NotFound';
import Navbar from '../components/Navbar';
import About from '../components/About';
import Footer from '../components/Footer'; // Importando o Footer
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { CartProvider } from '../context/CartContext'; // Certifique-se de que o caminho está correto

const AppRoutes = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // Função para logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <CartProvider> {/* Envolvendo todo o aplicativo com o CartProvider */}
      <Router>
        <Navbar user={user} onLogout={handleLogout} /> {/* A contagem do carrinho agora vem do CartContext */}
        <RouterRoutes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/add-product" element={user ? <AddProduct /> : <Auth onLogin={setUser} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/auth" element={<Auth onLogin={setUser} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      
      </Router>
    </CartProvider>
  );
};

export default AppRoutes;
