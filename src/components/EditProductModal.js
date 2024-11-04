import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../style/EditProductModal.css'; // Importa um CSS para personalizações adicionais

// Mapeamento de cores para seus valores hexadecimais
const colorMap = {
  'Bege': '#F5F5DC',
  'Prata': '#C0C0C0',
  'Preto': '#000000',
  'Rosa': '#FFC0CB',
  'Azul': '#0000FF',
  'Verde': '#008000',
  'Rose': '#FF007F', // ou '#FADADD' para um tom mais claro
  'Dourado': '#FFD700',
  'Marrom': '#8B4513',
  'Pink': '#FF69B4',
  'Marsala': '#800000', // ou '#B03060' para um tom mais próximo do vinho
  'Multicolor': '#FF5733' // Exemplo de tom multicolorido; este pode variar
};

const EditProductModal = ({ show, handleClose, product, setProduct, handleSave }) => {
  const handleCheckboxChange = (event) => {
    const { name, value, checked } = event.target;

    // Clona o array atual para não mutar o estado diretamente
    const updatedValues = Array.isArray(product[name]) ? [...product[name]] : [];

    if (checked) {
      // Se estiver checado, adiciona o valor ao array
      updatedValues.push(value);
    } else {
      // Se não estiver checado, remove o valor do array
      const index = updatedValues.indexOf(value);
      if (index > -1) {
        updatedValues.splice(index, 1);
      }
    }

    // Atualiza o produto com os novos valores
    setProduct((prevProduct) => ({ ...prevProduct, [name]: updatedValues }));
  };

  const handleImageUrlChange = (index, newUrl) => {
    const updatedImageUrls = [...product.imageUrls];
    updatedImageUrls[index] = newUrl;
    setProduct((prevProduct) => ({ ...prevProduct, imageUrls: updatedImageUrls }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="text-center" style={{ color: '#007bff' }}>Editar Produto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {product && (
          <Form>
            <Form.Group className="mb-3" controlId="formProductName">
              <Form.Label>Nome do Produto</Form.Label>
              <Form.Control
                type="text"
                value={product.name}
                onChange={(e) => setProduct((prevProduct) => ({ ...prevProduct, name: e.target.value }))} // Atualiza o nome
                placeholder="Digite o nome do produto"
                className="rounded-pill"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProductDescription">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={product.description}
                onChange={(e) => setProduct((prevProduct) => ({ ...prevProduct, description: e.target.value }))} // Atualiza a descrição
                placeholder="Digite a descrição do produto"
                className="rounded-pill"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProductPrice">
              <Form.Label>Preço (R$)</Form.Label>
              <Form.Control
                type="number"
                value={product.price}
                onChange={(e) => setProduct((prevProduct) => ({ ...prevProduct, price: parseFloat(e.target.value) }))} // Atualiza o preço
                placeholder="Digite o preço do produto"
                className="rounded-pill"
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formProductStock">
              <Form.Label>Quantidade em Estoque</Form.Label>
              <Form.Control
                type="number"
                value={product.stock}
                onChange={(e) => setProduct((prevProduct) => ({ ...prevProduct, stock: parseInt(e.target.value, 10) }))} // Atualiza o estoque
                placeholder="Digite a quantidade em estoque"
                className="rounded-pill"
                required
                min="0"
              />
            </Form.Group>

            {/* Cores Disponíveis */}
            <Form.Group className="mb-3" controlId="formProductColors">
              <Form.Label>Cores Disponíveis</Form.Label>
              <div className="checkbox-group">
                {Object.keys(colorMap).map((color) => (
                  <div key={color} className="form-check">
                    <input
                      type="checkbox"
                      id={color}
                      name="colors"
                      value={colorMap[color]} // Usa o valor hexadecimal correspondente
                      className="form-check-input"
                      checked={Array.isArray(product.colors) && product.colors.includes(colorMap[color])} // Verifica se a cor está selecionada
                      onChange={handleCheckboxChange} // Lógica para adicionar/remover a cor
                    />
                    <label htmlFor={color} className="form-check-label" style={{ color: colorMap[color] }}>
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Números Disponíveis */}
            <Form.Group className="mb-3" controlId="formProductSizes">
              <Form.Label>Números Disponíveis</Form.Label>
              {['34', '35', '36', '37', '38', '39'].map((size) => (
                <Form.Check
                  key={size}
                  type="checkbox"
                  id={size}
                  label={size}
                  value={size}
                  checked={Array.isArray(product.sizes) && product.sizes.includes(size)} // Verifica se o tamanho está selecionado
                  onChange={handleCheckboxChange}
                  name="sizes" // Nome do campo para tamanhos
                />
              ))}
            </Form.Group>

            {/* URLs das Imagens */}
            <Form.Group className="mb-3" controlId="formProductImages">
              <Form.Label>URLs das Imagens</Form.Label>
              {product.imageUrls.map((url, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)} // Atualiza a URL específica
                  placeholder={`Digite a URL da imagem ${index + 1}`}
                  className="rounded-pill mb-2"
                />
              ))}
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="rounded-pill">
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} className="rounded-pill" style={{ backgroundColor: '#007bff' }}>
          Salvar Alterações
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
