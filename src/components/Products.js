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
  const [zoomStyles, setZoomStyles] = useState({});
  const [filterName, setFilterName] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState([0, Infinity]);

  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesPrice = product.price >= filterPriceRange[0] && product.price <= filterPriceRange[1];
    return matchesName && matchesPrice;
  });
  

  const openImageModal = (images) => {
    setSelectedProductImages(images);
    setShowImageModal(true);
    setZoomStyles({});
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setZoomStyles({});
  };

  const handleZoomMove = (e, imageIndex) => {
    // Detecta se é um toque em dispositivo móvel ou mouse em desktop
    const isTouchEvent = e.type === 'touchmove';
    const clientX = isTouchEvent ? e.touches[0].clientX : e.clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : e.clientY;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width) * 100;
    const y = ((clientY - top) / height) * 100;

    setZoomStyles((prevZoomStyles) => ({
      ...prevZoomStyles,
      [imageIndex]: {
        transform: 'scale(2)',
        transformOrigin: `${x}% ${y}%`,
      },
    }));
  };

  const handleZoomEnd = (imageIndex) => {
    setZoomStyles((prevZoomStyles) => ({
      ...prevZoomStyles,
      [imageIndex]: { transform: 'scale(1)' },
    }));
  };

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

  const handlePreOrder = (product) => {
    console.log(`Produto ${product.name} encomendado!`);
    // Insira a lógica de envio de pedidos ou qualquer outra funcionalidade necessária.
  };
  


  return (
    <div className="product-container">

      <div className="filters-container">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="price-filter">
          <label className="filter-label">Faixa de preço:</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Mínimo"
              onChange={(e) => setFilterPriceRange([+e.target.value || 0, filterPriceRange[1]])}
              className="price-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Máximo"
              onChange={(e) => setFilterPriceRange([filterPriceRange[0], +e.target.value || Infinity])}
              className="price-input"
            />
             <h1 className="text-center ">Produtos</h1>
          </div>
         
        </div>
        
      </div>




      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Por favor, faça login para adicionar itens ao carrinho. Redirecionando para a página de login...
        </Alert>
      )}

      <Row className="justify-content-center">
        {filteredProducts.map((product) => (
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
                  <div className="button-container">
                    {product.stock === 0 ? (
                      <Button className="btn btn-warning encomendar" onClick={() => handlePreOrder(product)}>
                        Encomendar
                      </Button>
                    ) : (
                      <Button
                        className="btn btn-primary add-to-cart"
                        onClick={() => handleAddToCart(product)}
                      >
                        Selecionar Produto
                      </Button>
                    )}
                  </div>
                    )}
                  </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal para exibir as imagens do produto selecionado */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton>
         
        </Modal.Header>
        <Modal.Body className="image-modal-body">
          <Row className="g-2 justify-content-center">
            {selectedProductImages && selectedProductImages.length > 0 ? (
              selectedProductImages.map((url, index) => (
                <Col xs={12} md={6} lg={4} key={index} className="zoom-container">
                  <Card.Img
                    variant="top"
                    src={url}
                    className="zoom-image"
                    alt={`Imagem do produto ${index + 1}`}
                    style={zoomStyles[index] || { transform: 'scale(1)' }}
                    onMouseMove={(e) => handleZoomMove(e, index)}
                    onMouseLeave={() => handleZoomEnd(index)}
                    onTouchMove={(e) => handleZoomMove(e, index)}
                    onTouchEnd={() => handleZoomEnd(index)}
                  />
                </Col>
              ))
            ) : (
              <p>Nenhuma imagem disponível</p>
            )}
          </Row>
        </Modal.Body> 
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
