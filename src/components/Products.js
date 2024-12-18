import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Alert, Modal } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../data/firebaseConfig';
import '../style/Products.css';

import Footer from './Footer';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import CartModal from './CartModal';

const Products = ({ updateCartCount, product }) => {
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
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const filteredProductss = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesPrice = product.price >= filterPriceRange[0] && product.price <= filterPriceRange[1];
    return matchesName && matchesPrice;
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyFilters = () => {
    const filtered = products.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesPrice =
        product.price >= filterPriceRange[0] && product.price <= filterPriceRange[1];
      return matchesName && matchesPrice;
    });
    setFilteredProducts(filtered);
  };
  

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

 

  const handlePreOrder = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Adicionar dados do produto na coleção "encomendas"
      await addDoc(collection(db, "encomendas"), {
        ...product,
        preOrderFee: "R$10,00", // Exemplo de taxa fixa
        availableIn: "10 dias", // Disponibilidade
        createdAt: new Date().toISOString(),
      });

      setSuccess("Encomenda realizada com sucesso!");
    } catch (err) {
      setError("Erro ao processar a encomenda. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
      setShowModal(false); // Fechar o modal após confirmação
    }
  };
  


  return (
    <div className="product-container">
      <div style={{display: 'flex', justifyContent: 'center', gap: 65}}>
        <Button  style={{backgroundColor: '#ebaaeb',  padding: '10px 20px', border: 'none', color: 'black', marginBottom: '15px'}} onClick={toggleFilters}>
          {showFilters ? 'Ocultar Busca' : 'Fazer Busca'}
        </Button>
        <h1>Produtos</h1>
      </div>
      

      {showFilters && (
        <div className="filters-container mb-4">
          <input
            type="text"
            placeholder="Buscar por nome"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="filter-input"
          />
          <div className="price-inputs">
            <label className="filter-label">Faixa de preço:</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Mínimo"
                onChange={(e) =>
                  setFilterPriceRange([+e.target.value || 0, filterPriceRange[1]])
                }
                className="price-input"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Máximo"
                onChange={(e) =>
                  setFilterPriceRange([filterPriceRange[0], +e.target.value || Infinity])
                }
                className="price-input"
              />
            </div>
          </div>
        </div>
      )}






      {showAlert && (
        <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible>
          Por favor, faça login para adicionar itens ao carrinho. Redirecionando para a página de login...
        </Alert>
      )}

    <Row className="justify-content-center">
      {filteredProductss.map((product) => (
        <Col md={4} key={product.id} className="mb-4 d-flex justify-content-center">
          <Card className="product-card shadow-sm">
            <div className="image-container">
              <Card.Img
                variant="top"
                src={product.imageUrls[0]}
                className="product-image"
                alt={product.name}
                onClick={() => openImageModal(product.imageUrls)}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <Card.Body className="d-flex flex-column align-items-center">
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
                <div className="button-container d-flex justify-content-between w-100">
                  <Button
                    className="btn btn-editar"
                    onClick={() => handleEdit(product)}
                  >
                    <i className="fas fa-edit"></i> Editar
                  </Button>
                  <Button
                    className="btn btn-danger"
                    onClick={() => handleDeleteModal(product)}
                  >
                    <i className="fas fa-trash"></i> Excluir
                  </Button>
                </div>
              ) : (
                <div className="button-container">
                  {product.stock === 0 ? (
                    <Button
                    className="btn btn-warning encomendar"
                    onClick={() => setShowModal(true)}
                  >
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

      {/* Modal de Confirmação */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Encomenda</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Será cobrada uma taxa de <strong>R$10,00</strong> para esta encomenda.
          </p>
          <p>
            O produto estará disponível em <strong>10 dias</strong>.
          </p>
          <p>Deseja confirmar a encomenda do produto <strong></strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" style={{width: '100%'}} onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={handlePreOrder}
            disabled={loading}
          >
            {loading ? "Processando..." : "Confirmar Encomenda"}
          </Button>
        </Modal.Footer>
      </Modal>

    


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
