import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Modal } from 'react-bootstrap';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import CartModal from './CartModal';
import FinalizePurchase from './FinalizePurchase'; 
import ShippingCalculator from './ShippingCalculator'; 
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
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const auth = getAuth();
  // Função para buscar produtos
 

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

  const handleShowFinalizeModal = () => setShowFinalizeModal(true);
  const handleCloseFinalizeModal = () => setShowFinalizeModal(false);

  const calculateTotalWithFreight = () => {
    const subtotal = parseFloat(calculateTotal());
    return (subtotal + shippingCost).toFixed(2);
  };
  
  return (
    <div className="cart-container mt-5">
      <h1 className="text-center mb-4">Carrinho</h1>
      {cartItems.length === 0 ? (
        <div className="text-center">
        <p>Seu carrinho está vazio.</p>
        <hr />
        <p>
          ✔ <strong>Após confirmação de pagamento, a entrega é realizada em até 10 dias úteis.</strong>
        </p>
        <p>
          ✔ <strong>Política de Trocas:</strong> Realizamos trocas com o frete por nossa conta somente se o produto apresentar defeito de fabricação.
          <br />
          ✔ Caso queira trocar por outro motivo, o frete será por conta do cliente.
        </p>
        <p>Explore nossos produtos e adicione itens ao seu carrinho!</p>
      </div>
      
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
          

          {/* Ajuste da seção para exibição lado a lado */}
          <div className="shipp-section d-flex justify-content-between mt-4">
            <div className="shipping-section flex-fill me-3">
              <ShippingCalculator cartItems={cartItems} setShippingCost={setShippingCost} />
            </div>

            <div className="totals-section flex-fill ms-3">
              <h3 className="text-end cart-total">Total (sem frete): R$ {calculateTotal()}</h3>
              {shippingCost > 0 && (
                <h4 className="text-end cart-total text-success">
                  Total com Frete: R$ {(parseFloat(calculateTotal()) + shippingCost).toFixed(2)}
                </h4>
              )}
            </div>
          </div>

          <div className="shipp-section d-flex justify-content-center align-items-center mt-1" style={{ minHeight: '5vh' }}>
            <Button onClick={handleShowFinalizeModal} className="botao-purchase">
              Finalizar Carrinho
            </Button>
          </div>

         

          <Modal show={showFinalizeModal} onHide={handleCloseFinalizeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Finalizar Compra</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <FinalizePurchase 
                user={user} 
                cartItems={cartItems} 
                calculateTotal={calculateTotal} 
                setCartItems={setCartItems} 
                totalWithFreight={calculateTotalWithFreight()} // Chamada da nova função
              />
            </Modal.Body>
          </Modal>

        </>
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
