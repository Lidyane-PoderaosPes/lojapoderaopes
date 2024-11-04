import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import { Card, Col, Row, Modal, Button } from 'react-bootstrap';
import '../style/Home.css';
import Footer from '../components/Footer';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProductImages, setSelectedProductImages] = useState([]);
  const [zoomStyles, setZoomStyles] = useState({});

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
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, 'products');
        const productSnapshot = await getDocs(productsCollection);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Bem-vindo à loja Poder aos Pés</h1>
        <p className="hero-subtitle">Explore nossos produtos de calçados femininos!</p>
      </div>

      <div className="featured-products">
        <h2 className="section-title">Produtos em Destaque</h2>
        {loading ? (
          <p>Carregando produtos...</p>
        ) : (
          <Row className="product-list">
            {products.map((product) => (
              <Col md={4} key={product.id} className="mb-4">
                <Card className="product-card">
                  <Card.Img
                    variant="top"
                    src={product.imageUrls[0]}
                    className="product-image"
                    alt={product.name}
                    onClick={() => openImageModal(product.imageUrls)}
                    style={{ cursor: 'pointer' }}
                  />
                  <Card.Body>
                    <Card.Title className="product-name">{product.name}</Card.Title>
                    <Card.Text className="product-price">
                      Preço: R$ {product.price.toFixed(2)}
                    </Card.Text>
                    <Card.Text className="product-description">
                      {product.description}
                    </Card.Text>                   
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Modal para exibir as imagens do produto selecionado */}
      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Imagens do Produto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            {selectedProductImages && selectedProductImages.length > 0 ? (
              selectedProductImages.map((url, index) => (
                <Col xs={6} md={4} key={index} className="zoom-container">
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

        <Modal.Footer>
          <Button variant="secondary" onClick={closeImageModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default Home;
