import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Modal } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore'; // Corrigido
import { db } from '../data/firebaseConfig';
import CartModal from './CartModal';
import FinalizePurchase from './FinalizePurchase'; 
import '../style/Cart.css';

// Mapeamento de cores
const colorNames = {
  '#C0C0C0': 'Prata',
  '#F5F5DC': 'Bege',
  '#FF0000': 'Vermelho',
  '#008000': 'Verde', 
  '#0000FF': 'Azul',
  '#FFFFFF': 'Branco',
  '#000000': 'Preto',
  '#FFC0CB': 'Rosa',
  '#FF007F': 'Rose', // ou '#FADADD' para um tom mais claro
  '#FFD700': 'Dourado',
  '#8B4513': 'Marrom',
  '#FF69B4': 'Pink',
  '#800000': 'Marsala', // ou '#B03060' para um tom mais próximo do vinho
  '#FF5733': 'Multicolor' // Exemplo de tom multicolorido; este pode variar
  // Adicione mais cores conforme necessário
};

const getColorName = (color) => colorNames[color] || 'Cor desconhecida';

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState([]); 
  const [showFinalizeModal, setShowFinalizeModal] = useState(false); // Controle para o modal de Finalizar Compra
  const auth = getAuth();

  // Função para buscar produtos
  const fetchProducts = async () => {
    try {
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      console.error("Erro ao buscar produtos: ", error);
    }
  };

  useEffect(() => {
    const storedCartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(Array.isArray(storedCartItems) ? storedCartItems : []);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setCartItems([]);
        localStorage.removeItem('cart');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAddProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleProceed = (productWithDetails) => {
    const updatedCart = [
      ...cartItems,
      {
        ...productWithDetails.product,
        color: productWithDetails.options.color,
        size: productWithDetails.options.size,
        quantity: productWithDetails.options.quantity, 
      },
    ];
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setShowModal(false);
  };

  const handleRemove = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const openImageModal = (images) => {
    setSelectedProductImages(images); 
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  // Função para abrir o modal de finalizar compra
  const handleShowFinalizeModal = () => setShowFinalizeModal(true);
  const handleCloseFinalizeModal = () => setShowFinalizeModal(false);

  return (
    <div className="cart-container mt-5">
      <h1 className="text-center mb-4">Carrinho</h1>
      {cartItems.length === 0 ? (
        <p className="text-center">Seu carrinho está vazio.</p>
      ) : (
        <>
          <div className="orh">
            {cartItems.map((item) => (
              <Card key={item.id} className="cart-card mb-3">
                <div className="d-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <Card.Title className="cart-title">{item.name}</Card.Title>
                  <Card.Img
                    variant="top"
                    src={item.imageUrls[0]} // Corrigido: Usando 'item' em vez de 'product'
                    className="product-image"
                    onClick={() => openImageModal(item.imageUrls)} // Abre o modal com as imagens do item
                  />
                  <div>
                    <Card.Body className="cart-body">
                      <Card.Text className="cart-text">
                        <span style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          Preço: R$ {item.price.toFixed(2)}
                        </span>
                        <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                          <span>Quantidade: {item.quantity}</span>
                          <span>Cor: {getColorName(item.color) || 'N/A'}</span>
                        </div>
                        <span style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>Tamanho: {item.size || 'N/A'}</span>
                      </Card.Text>
                      <Button variant="danger" onClick={() => handleRemove(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        Remover do Carrinho
                      </Button>
                    </Card.Body>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <h3 className="text-end cart-total">Total: R$ {calculateTotal()}</h3>

          <Button variant="primary" onClick={handleShowFinalizeModal} className="botao-purchase">
            Finalizar Carrinho
          </Button>

          <Modal show={showFinalizeModal} onHide={handleCloseFinalizeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title >Finalizar Compra</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FinalizePurchase user={user} cartItems={cartItems} calculateTotal={calculateTotal} setCartItems={setCartItems} />
            </Modal.Body>
           
          </Modal></>
      )}

      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Imagens do Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            {selectedProductImages.map((url, index) => (
              <Col xs={6} md={4} key={index}> 
                <Card.Img variant="top" src={url} className="product-image" />
              </Col>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeImageModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {selectedProduct && (
        <CartModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          product={selectedProduct}
          handleProceed={handleProceed}
        />
      )}
    </div>
  );
};

export default Cart;
