import React from 'react';
import PropTypes from 'prop-types';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o Bootstrap
import '../../style/ProductForm.css'; // Importa o CSS customizado

const ProductForm = ({ product, onChange, onFileChange, message }) => {
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


  const handleCheckboxChange = (event) => {
    const { name, value, checked } = event.target;
    const updatedValues = Array.isArray(product[name]) ? [...product[name]] : [];

    if (checked) {
      updatedValues.push(value);
    } else {
      const index = updatedValues.indexOf(value);
      if (index > -1) {
        updatedValues.splice(index, 1);
      }
    }

    onChange({ target: { name, value: updatedValues } });
  };

  return (
    <form className="product-form container mt-4 p-4 rounded shadow-sm">
      {message && <p className="alert alert-info">{message}</p>}

      <div className="form-group">
        <label htmlFor="name">Nome do Produto:</label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-control"
          value={product.name}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Descrição:</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          value={product.description}
          onChange={onChange}
          required
        ></textarea>
      </div>

      {/* Preço e Quantidade em Estoque alinhados horizontalmente */}
      <div className="form-row">
        <div className="form-group col-md-5">
          <label htmlFor="price">Preço:</label>
          <input
            type="number"
            id="price"
            name="price"
            className="form-control"
            value={product.price}
            onChange={onChange}
            required
            min="0"
          />
        </div>

        <div className="form-group col-md-5">
          <label htmlFor="stock">Quantidade em Estoque:</label>
          <input
            type="number"
            id="stock"
            name="stock"
            className="form-control"
            value={product.stock}
            onChange={onChange}
            required
            min="0"
          />
        </div>
      </div>

      {/* Cores e Números Disponíveis alinhados horizontalmente */}
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Cores Disponíveis:</label>
          <div className="checkbox-group">
            {Object.keys(colorMap).map((color) => (
              <div key={color} className="form-check">
                <input
                  type="checkbox"
                  id={color}
                  name="colors"
                  value={colorMap[color]}
                  className="form-check-input"
                  checked={Array.isArray(product.colors) && product.colors.includes(colorMap[color])}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={color} className="form-check-label">{color}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group col-md-6">
          <label>Números Disponíveis:</label>
          <div className="checkbox-group">
            {['34', '35', '36', '37', '38', '39'].map((size) => (
              <div key={size} className="form-check">
                <input
                  type="checkbox"
                  id={size}
                  name="sizes"
                  value={size}
                  className="form-check-input"
                  checked={Array.isArray(product.sizes) && product.sizes.includes(size)}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor={size} className="form-check-label">{size}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campo Categoria com tamanho reduzido */}
      <div className="form-group col-md-4">
        <label htmlFor="category">Categoria:</label>
        <select
          id="category"
          name="category"
          className="form-control"
          value={product.category}
          onChange={onChange}
          required
        >
          <option value="">Selecione...</option>
          <option value="Sandálias">Sandálias</option>
          <option value="Rasteirinhas">Rasteirinhas</option>
          <option value="Sapatilhas">Sapatilhas</option>
          <option value="Scarpin.">Scarpin</option>     
          <option value="Botas">Botas</option>
        </select>
      </div>

      <br />

      {/* Campo para carregar até 3 imagens separadas */}
      <div className="form-group">
      <label htmlFor="images">Imagens (até 3):</label>
        <input
          type="file"
          name="images"
          multiple // Permite seleção de múltiplos arquivos
          accept="image/*"
          className="form-control-file"
          onChange={onFileChange} // Função passada via props para lidar com as mudanças
          max="3" // Limite para até 3 arquivos
        />
      </div>

      

      {/* Exibe as imagens selecionadas */}
      {product.images && product.images.length > 0 && (
        <div className="mt-2">
          <p>Imagens selecionadas:</p>
          <ul className="mt-2">
            {product.images.map((image, index) => (
              <li key={index}>{image.name}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

ProductForm.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    category: PropTypes.string.isRequired,
    stock: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    colors: PropTypes.arrayOf(PropTypes.string),
    sizes: PropTypes.arrayOf(PropTypes.string),
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)), // Para múltiplas imagens
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  message: PropTypes.string,
};

export default ProductForm;
