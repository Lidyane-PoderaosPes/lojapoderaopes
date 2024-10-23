import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ProductSelectionModal = ({ show, handleClose, product, handleAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = React.useState({
    color: '',
    size: ''
  });

  // Verifica se o produto está carregado antes de renderizar o conteúdo
  if (!product) {
    return null; // Ou você pode retornar um loading spinner ou mensagem
  }

  const handleProceed = () => {
    if (selectedOptions.color && selectedOptions.size) {
      handleAddToCart({ ...product, ...selectedOptions });
      handleClose();
    } else {
      alert('Por favor, selecione uma cor e um tamanho.');
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Selecionar Opções para {product.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="colorSelect">
            <Form.Label>Cor:</Form.Label>
            <Form.Control
              as="select"
              value={selectedOptions.color}
              onChange={(e) => setSelectedOptions({ ...selectedOptions, color: e.target.value })}
            >
              <option value="">Escolha uma cor</option>
              {product.colors.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="sizeSelect">
            <Form.Label>Tamanho:</Form.Label>
            <Form.Control
              as="select"
              value={selectedOptions.size}
              onChange={(e) => setSelectedOptions({ ...selectedOptions, size: e.target.value })}
            >
              <option value="">Escolha um tamanho</option>
              {product.sizes.map((size, index) => (
                <option key={index} value={size}>{size}</option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleProceed}>
          Adicionar ao Carrinho
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductSelectionModal;
