import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import { Card, Modal, Carousel, Col, Row } from 'react-bootstrap';
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
        const productList = productSnapshot.docs.map((doc) => ({
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

  // Dividir produtos em grupos de 3
  const groupedProducts = [];
  for (let i = 0; i < products.length; i += 3) {
    groupedProducts.push(products.slice(i, i + 3));
  }

  return (
    <div className="home-container">
      <div className="hero-section text-center">
        <h1 className="hero-title">Bem-vindo à loja Poder aos Pés</h1>
        <p className="hero-subtitle">Explore nossos produtos de calçados femininos!</p>
      </div>

      <div className="featured-products">
        <h2 className="section-title text-center">Produtos em Destaque</h2>
        {loading ? (
          <p className="text-center">Carregando produtos...</p>
        ) : (
          <Carousel
            interval={10000}
            controls
            indicators
            nextIcon={<span className="carousel-arrow carousel-arrow-next">&rsaquo;</span>}
            prevIcon={<span className="carousel-arrow carousel-arrow-prev" >&lsaquo;</span>}
          >
            {groupedProducts.map((items, idx) => (
              <Carousel.Item key={idx}>
                <div className="d-flex justify-content-center flex-wrap">
                  {items.map((product) => (
                    <Card className="product-card text-center mx-2" key={product.id} style={{ width: '200px', height: '350px' }}>
                      <Card.Img
                        variant="top"
                        src={product.imageUrls[0]}
                        className="product-image"
                        alt={product.name}
                        onClick={() => openImageModal(product.imageUrls)}
                        style={{ cursor: 'pointer', objectFit: 'cover', height: '150px' }}
                      />
                      <Card.Body>
                        <Card.Title className="product-name">{product.name}</Card.Title>
                        <Card.Text className="product-price">Preço: R$ {product.price.toFixed(2)}</Card.Text>
                        <Card.Text className="product-description">{product.description}</Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </div>

      <Modal show={showImageModal} onHide={closeImageModal} size="lg" centered>
            <Modal.Header closeButton></Modal.Header>
            <Modal.Body className="image-modal-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Carousel
                controls
                indicators
                interval={null} // Desativa a troca automática
                wrap={false} // Evita o loop automático ao final da lista
              >
                {selectedProductImages.map((url, index) => (
                  <Carousel.Item key={index}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                     <Col  lg={6} key={index} style={{
                        display: 'flex',
                        justifyContent: 'center',
                      
                        position: 'relative',
                      }}>
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
                    </div>
                  </Carousel.Item>
                ))}
                
              </Carousel>
            </Modal.Body>
          </Modal>


      <Footer />
    </div>
  );
};

export default Home;
