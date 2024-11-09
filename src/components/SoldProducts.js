import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import '../style/SoldProducts.css'; // Importe o arquivo CSS

// Mapeamento de cores
const colorNames = {
  '#C0C0C0': 'Prata',
  '#F5F5DC': 'Bege',
  '#FF0000': 'Vermelho',
  '#008000': 'Verde',
  '#0000FF': 'Azul',
  '#FFFFFF': 'Branco',
  '#000000': 'Preto',
  '#FFC0CB': 'Rosa',
  '#FF007F': 'Rose',
  '#FFD700': 'Dourado',
  '#8B4513': 'Marrom',
  '#FF69B4': 'Pink',
  '#800000': 'Marsala',
  '#FF5733': 'Multicolor'
  // Adicione mais cores conforme necessário
};

const getColorName = (color) => colorNames[color] || 'Cor desconhecida';

const SoldProducts = () => {
  const [soldItems, setSoldItems] = useState([]);

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'purchases'));
        const soldData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          delivered: false // Adiciona uma propriedade inicial de "delivered"
        }));
        setSoldItems(soldData);
      } catch (error) {
        console.error('Erro ao buscar produtos vendidos:', error);
      }
    };

    fetchSoldProducts();
  }, []);

  const handleCheckboxChange = (id) => {
    setSoldItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, delivered: !item.delivered } : item
      )
    );
  };

  return (
    <div className="sold-products-container">
      <h2 className="title">Produtos Vendidos</h2>
      <ul className="product-list">
        {soldItems.map((item) => (
          <li key={item.id} className="product-item">
            <p className="product-info"><strong>Comprador:</strong> {item.userName}</p>
            <p className="product-info"><strong>E-mail:</strong> {item.email}</p>
            <p className="product-info"><strong>Endereço:</strong> {item.address}</p> {/* Exibe o endereço */}
            <p className="product-info"><strong>CEP:</strong> {item.cep}</p> {/* Exibe o CEP */}
            <p className="product-info"><strong>Itens:</strong> {item.items.map((i, index) => (
              <span key={index} className="item-details">
                {`${i.name} (Cor: ${getColorName(i.color)}, Tamanho: ${i.size}, Quantidade: ${i.quantity})`}
              </span>
            ))}</p>
            <p className="product-info"><strong>Total:</strong> R$ {item.total}</p>
            <p className="product-info"><strong>Data da compra:</strong> {item.createdAt && new Date(item.createdAt.seconds * 1000).toLocaleString()}</p>
            <div className="checkbox-container">
              <label>
                <input
                  type="checkbox"
                  checked={item.delivered}
                  onChange={() => handleCheckboxChange(item.id)}
                />
                Compra Entregue
              </label>
            </div>
            <p className="delivery-status"><strong>Status de Entrega:</strong> {item.delivered ? 'Entregue' : 'Pendente'}</p>
            <hr className="divider" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SoldProducts;
