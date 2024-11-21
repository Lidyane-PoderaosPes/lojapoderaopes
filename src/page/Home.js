import React, { useEffect, useState, useRef } from 'react';
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
  const scrollContainerRef = useRef(null);

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

  // Função para habilitar drag-and-scroll
  const enableScroll = () => {
    const container = scrollContainerRef.current;
    let isDragging = false;
    let startX;
    let scrollLeft;

    if (container) {
      container.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
      });

      container.addEventListener('mouseleave', () => {
        isDragging = false;
      });

      container.addEventListener('mouseup', () => {
        isDragging = false;
      });

      container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade do scroll
        container.scrollLeft = scrollLeft - walk;
      });
    }
  };

  useEffect(() => {
    enableScroll();
  }, []); // Certifique-se de que a função seja chamada apenas uma vez ao montar

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return; // Verifica se o ref está definido
    const container = scrollContainerRef.current;
    container.isDown = true;
    container.startX = e.pageX - container.offsetLeft;
    container.scrollLeft = container.scrollLeft;
  };
  
  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return; // Verifica se o ref está definido
    const container = scrollContainerRef.current;
    container.isDown = false;
  };
  
  const handleMouseUp = () => {
    if (!scrollContainerRef.current) return; // Verifica se o ref está definido
    const container = scrollContainerRef.current;
    container.isDown = false;
  };
  
  const handleMouseMove = (e) => {
    if (!scrollContainerRef.current || !scrollContainerRef.current.isDown) return; // Verifica se o ref e `isDown` estão definidos
    e.preventDefault();
    const container = scrollContainerRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - container.startX) * 1.5; // Velocidade de arrasto
    container.scrollLeft = container.scrollLeft - walk;
  };
  

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
          <div
          className="image-scroll-container"
          ref={scrollContainerRef} // Ref conectado corretamente
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <Row className="flex-nowrap">
            {products.slice(0, 5).map((product, index) => (
              <Col md={4} key={product.id} className={`mb-4 ${index === 3 ? 'show-half' : ''}`}>
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
        </div>
        )}
      </div>

      {/* Modal para exibir as imagens do produto selecionado */}
        <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body className="image-modal-body">
            <div
              className="image-scroll-container"
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <Row className="flex-nowrap">
                {selectedProductImages && selectedProductImages.length > 0 ? (
                  selectedProductImages.map((url, index) => (
                    <Col xs={12} md={3} lg={2} key={index} className="zoom-container">
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
            </div>
          </Modal.Body>
        </Modal>


      <Footer />
    </div>
  );
};

export default Home;
