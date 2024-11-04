import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../style/CartModal.css';

// Estilos adicionais
const modalStyles = {
  color: '#333333',
  fontFamily: 'Open Sans, sans-serif',
};

const titleStyles = {
  fontFamily: 'Playfair Display, serif',
  color: '#FAB1B1',
};

const infoTextStyles = {
  fontFamily: 'Open Sans, sans-serif',
  color: '#FAB1B1',
};

// Mapeamento de cores em hexadecimal para nomes
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

const CartModal = ({ show, handleClose, product, handleProceed }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(''); // Estado para a mensagem de erro

  const handleBlur = (e) => {
    const value = Math.max(1, Math.min(e.target.value, product.stock)); // Limita o valor ao estoque e 1
    setQuantity(value);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    
    // Verifica se o valor é maior que o estoque e exibe a mensagem de erro
    if (value > product.stock) {
      setError(`Erro: a quantidade selecionada excede o estoque disponível (${product.stock}).`);
    } else {
      setError(''); // Limpa a mensagem de erro se o valor estiver dentro do limite
    }
  };

  // Definir o primeiro tamanho disponível como o padrão
  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]); // Define o primeiro tamanho como selecionado por padrão
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Por favor, selecione uma cor e um tamanho.');
      return;
    }

    handleProceed({
      product: product,
      options: {
        color: selectedColor,
        size: selectedSize,
        quantity: quantity,
      },
    });
  };

  const getColorName = (color) => colorNames[color] || 'Cor desconhecida';

  const getColorPreview = (color) => {
    if (color) {
      return (
        <div
          style={{
            backgroundColor: color,
            width: '30px',
            height: '30px',
            display: 'inline-block',
            marginLeft: '10px',
            border: '1px solid #ccc',
            borderRadius: '50%',
          }}
        />
      );
    }
    return null;
  };

  if (!product) {
    return null;
  }

   // Função para garantir que a quantidade não ultrapasse o estoque
   const handleQuantityChange = (value) => {
    const validQuantity = Math.max(1, Math.min(value, product.stock)); // Valor mínimo é 1 e o máximo é o estoque
    setQuantity(validQuantity);
  };

  var stoke = product.stock

  return (
    <Modal show={show} onHide={handleClose} style={modalStyles}>
      <Modal.Header closeButton>
        <Modal.Title style={titleStyles}>Selecione Cor e Tamanho</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <div className='sas'>
            <Form.Label>Escolha a cor:</Form.Label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Form.Control
              as="select"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              style={{ maxWidth: '200px', fontFamily: 'Montserrat, sans-serif' }}
            >
              <option value="">Selecione uma cor</option>
              {product.colors && product.colors.map((color, index) => (
                <option key={index} value={color}>
                  {getColorName(color)}
                </option>
              ))}
            </Form.Control>
            {getColorPreview(selectedColor)}
          </div>
        </Form.Group>

        <Form.Group>
          <div className='sas'>
            <Form.Label>Tamanhos Disponíveis</Form.Label>
          </div>
          <div className='ass'>
            {product.sizes && product.sizes.length > 0 ? (
              product.sizes.map((size, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  label={size}
                  name="size"
                  value={size}
                  checked={selectedSize === size}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={{ color: '#F08080' }}
                />
              ))
            ) : (
              <p>Nenhum tamanho disponível.</p>
            )}
          </div>
        </Form.Group>

        <div className='sis'>
          <Form.Group>
            <div className='sas'>
              <Form.Label>Quantidade (Em estoque: {product.stock})</Form.Label>
            </div>
            <div className='sist' style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Form.Control
                 
                  type="number"
                  value={quantity}
                  min={1}
                  max={product.stock}
                  onChange={handleChange} // Atualiza o valor ao digitar
                  onBlur={handleBlur} // Corrige o valor ao perder o foco
                />
                
                {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe a mensagem de erro */}
          


            </div>
          </Form.Group>
        </div>


        <p style={infoTextStyles}>
          O produto "{product?.name}" será adicionado ao seu carrinho com a cor "{getColorName(selectedColor)}" e tamanho "{selectedSize}". Deseja continuar comprando ou finalizar a compra?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" 
          onClick={handleAddToCart}
          disabled={!!error} // Desativa o botão se houver um erro
        >
          Adicionar ao Carrinho
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CartModal;
