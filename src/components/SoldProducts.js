import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import '../style/SoldProducts.css'; // Estilo personalizado

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
  '#FF5733': 'Multicolor',
};

const getColorName = (color) => colorNames[color] || 'Cor desconhecida';

// Agrupa produtos vendidos por mês
const groupSoldItemsByMonth = (soldItems) => {
  return soldItems.reduce((acc, item) => {
    const date = new Date(item.createdAt.seconds * 1000);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(item);

    return acc;
  }, {});
};

const SoldProducts = () => {
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'purchases'));
        const soldData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSoldItems(soldData);
      } catch (error) {
        console.error('Erro ao buscar produtos vendidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldProducts();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Atualiza o status no banco de dados
      const itemRef = doc(db, 'purchases', id);
      await updateDoc(itemRef, { status: newStatus });

      // Atualiza o estado local
      setSoldItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar o status no Firebase:', error);
    }
  };

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Carregando produtos vendidos...</p>
      </div>
    );
  }

  const groupedItems = groupSoldItemsByMonth(soldItems);

  return (
    <div className="sold-products-container">
      <h2 className="title">Produtos Vendidos por Mês</h2>
      {Object.keys(groupedItems).length > 0 ? (
        Object.entries(groupedItems).map(([month, items]) => (
          <div key={month} className="month-section">
            <h3 className="month-title" onClick={() => toggleMonth(month)}>
              {month} ({items.length} produtos)
            </h3>
            {expandedMonths[month] && (
              <ul className="product-list">
                {items.map((item) => (
                  <li key={item.id} className="product-item">
                    <p className="product-info"><strong>Comprador:</strong> {item.userName}</p>
                    <p className="product-info"><strong>E-mail:</strong> {item.email}</p>
                    <p className="product-info-inline">
                      <strong>Endereço:</strong> {item.address} | <strong>CEP:</strong> {item.cep}
                    </p>
                    <p className="product-info">
                      <strong>Itens:</strong>{' '}
                      {item.items.map((i, index) => (
                        <span key={index} className="item-details">
                          {`${i.name} (Cor: ${getColorName(i.color)}, Tamanho: ${i.size}, Quantidade: ${i.quantity})`}
                        </span>
                      ))}
                    </p>
                    <p className="product-info-inline">
                      <strong>Total:</strong> R$ {parseFloat(item.total).toFixed(2)} |{' '}
                      <strong>Data da compra:</strong>{' '}
                      {item.createdAt && new Date(item.createdAt.seconds * 1000).toLocaleString()}
                    </p>
                    <div className="status-container">
                      <label className="status-label">
                        <strong>Status de Entrega:</strong>
                        <select
                          className="status-select"
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregue">Entregue</option>
                        </select>
                      </label>
                    </div>
                    <hr className="divider" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      ) : (
        <p>Nenhum produto vendido até o momento.</p>
      )}
    </div>
  );
};

export default SoldProducts;
