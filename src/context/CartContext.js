import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(0);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const loadCartItems = () => {
      try {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = storedCart.reduce((total, item) => total + item.quantity, 0);
        setCartItems(totalItems);
        setCart(storedCart); // Armazena o carrinho no estado
      } catch (error) {
        console.error('Erro ao carregar o carrinho do localStorage', error);
      }
    };

    loadCartItems(); // Carrega os itens do carrinho ao montar o componente
  }, []);

  const addToCart = (product) => {
    try {
      const updatedCart = [...cart];
      const existingProduct = updatedCart.find(item => item.id === product.id);

      if (existingProduct) {
        existingProduct.quantity += 1; // Incrementa a quantidade se o produto já estiver no carrinho
      } else {
        updatedCart.push({ ...product, quantity: 1 }); // Adiciona novo produto ao carrinho
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      setCart(updatedCart); // Atualiza o estado do carrinho
      const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0);
      setCartItems(totalItems); // Atualiza a contagem de itens no contexto
    } catch (error) {
      console.error('Erro ao adicionar produto ao carrinho', error);
    }
  };

  const removeFromCart = (id) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    const totalItems = updatedCart.reduce((total, item) => total + item.quantity, 0);
    setCartItems(totalItems);
  };
  
  const clearCart = () => {
    localStorage.removeItem('cart');
    setCartItems(0); // Reseta a contagem de itens do carrinho
  };
  
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cart }}>
      {children}
    </CartContext.Provider>
  );
};
