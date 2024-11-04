import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Alert, Modal } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../data/firebaseConfig';
import '../style/Products.css';

import Footer from './Footer';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import CartModal from './CartModal';

const Products = ({ updateCartCount }) => {
  const [products, setProducts] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false); // Estado para o modal de imagens
  const [selectedProductImages, setSelectedProductImages] = useState([]); // Estado para armazenar as imagens do produto selecionado
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, []);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user ? user.email : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const productRef = doc(db, 'products', currentProduct.id);
      await updateDoc(productRef, {
        name: currentProduct.name,
        description: currentProduct.description,
        price: currentProduct.price,
        stock: currentProduct.stock,
        imageUrls: currentProduct.imageUrls,
        colors: currentProduct.colors,
        sizes: currentProduct.sizes,
      });
      fetchProducts();
      setShowEditModal(false);
    } catch (error) {
      console.error("Erro ao atualizar o produto: ", error);
    }
  };

  const handleDeleteModal = (product) => {
    setCurrentProduct(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', currentProduct.id));
      fetchProducts();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Erro ao excluir o produto: ", error);
    }
  };

  const handleAddToCart = (product) => {
    if (!userEmail) {
      setShowAlert(true);
      setTimeout(() => navigate('/auth'), 3000);
    } else {
      setCurrentProduct(product);
      setShowCartModal(true);
    }
  };

  const openImageModal = (images) => {
    setSelectedProductImages(images); // Armazena as imagens do produto selecionado
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <div className="product-container">
      <h1 className="text-center mb-4 title">Produtos</h1>

      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Por favor, faça login para adicionar itens ao carrinho. Redirecionando para a página de login...
        </Alert>
      )}

      <Row className="justify-content-center">
        {products.map((product) => (
          <Col md={4} key={product.id} className="mb-4">
            <Card className="product-card shadow-sm">
              <Card.Body>
                <div className="product-images">
                  {/* Exibe apenas a imagem na posição 0 inicialmente */}
                  <Card.Img
                    variant="top"
                    src={product.imageUrls[0]}
                    className="product-image"
                    onClick={() => openImageModal(product.imageUrls)} // Abre o modal com as imagens do produto
                  />
                </div>
                <Card.Title className="product-name">{product.name}</Card.Title>
                <Card.Text className="product-price">
                  Preço: R$ {product.price.toFixed(2)}
                </Card.Text>
                
                <Card.Text className="product-stock">
                  {product.stock === 0 ? (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Produto esgotado</span>
                  ) : (
                    `Estoque: ${product.stock} unidades disponíveis`
                  )}
                </Card.Text>

                <Card.Text className="product-sizes">
                  <span>Tamanhos disponíveis:</span>
                  <div className="size-bullets">
                    {product.sizes.map((size, index) => (
                      <span key={index} className="size-bullet">
                        {size} 
                      </span>
                    ))}
                  </div>
                </Card.Text>


                <Card.Text className="product-colors">
                  <span>Cores disponíveis:</span>
                  <div className="color-bullets">
                    {product.colors.map((color, index) => (
                      <span
                        key={index}
                        className="color-bullet"
                        style={{ backgroundColor: color }}
                      ></span>
                    ))}
                  </div>
                </Card.Text>
                {userEmail === 'adm@adm.com' ? (
                  <div className="button-container">
                    <Button className="btn btn-editar" onClick={() => handleEdit(product)}>
                      <i className="fas fa-edit"></i>
                      Editar
                    </Button>
                    <Button className="btn btn-danger" onClick={() => handleDeleteModal(product)}>
                      <i className="fas fa-trash"></i>
                      Excluir
                    </Button>
                  </div>
                ) : (
                  <Button className="btn btn-primary add-to-cart" onClick={() => handleAddToCart(product)}>
                    Selecionar Produto
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para exibir as imagens apenas do produto selecionado */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Imagens do Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            {selectedProductImages.map((url, index) => (
              <Col xs={6} md={4} key={index}> {/* Adiciona responsividade com xs e md */}
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

      {/* Modals */}
      <EditProductModal
        show={showEditModal}
        handleClose={() => setShowEditModal(false)}
        product={currentProduct}
        setProduct={setCurrentProduct}
        handleSave={handleSaveEdit}
      />
      <DeleteProductModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        product={currentProduct}
        handleDelete={handleDelete}
      />
      <CartModal
        show={showCartModal}
        handleClose={() => setShowCartModal(false)}
        product={currentProduct}
        handleProceed={(selectedOptions) => {
          const cart = JSON.parse(localStorage.getItem('cart')) || [];
          const existingProduct = cart.find(item => item.id === selectedOptions.product.id);
          
          if (existingProduct) {
            existingProduct.quantity += selectedOptions.options.quantity;
            existingProduct.color = selectedOptions.options.color;
            existingProduct.size = selectedOptions.options.size;
          } else {
            cart.push({ 
              ...selectedOptions.product, 
              quantity: selectedOptions.options.quantity,
              color: selectedOptions.options.color,
              size: selectedOptions.options.size
            });
          }
          
          localStorage.setItem('cart', JSON.stringify(cart));
          setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
          setShowCartModal(false);
        }}
      />
      
      <Footer />
    </div>
  );
};

export default Products
