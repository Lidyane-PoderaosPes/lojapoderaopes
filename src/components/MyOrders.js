import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import Spinner from 'react-bootstrap/Spinner'; // Para exibir carregamento
import '../style/MyOrders.css';

const getColorName = (color) => {
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
  return colorNames[color] || 'Cor desconhecida';
};

const MyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const purchasesRef = collection(db, 'purchases'); // Coleção 'purchases'
          const q = query(purchasesRef, where('userId', '==', user.uid)); // Filtra pelo userId
          const querySnapshot = await getDocs(q);

          const fetchedOrders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(fetchedOrders);
        } catch (error) {
          console.error('Erro ao buscar pedidos:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Meus Pedidos</h2>
      {orders.length > 0 ? (
        <ul className="orders-list">
          {orders.map(order => (
            <li key={order.id} className="order-item">
              <p><strong>Pedido ID:</strong> {order.id}</p>
              <p><strong>Total:</strong> R$ {parseFloat(order.total).toFixed(2)}</p>
              <p><strong>Método de Pagamento:</strong> {order.paymentMethod}</p>
              <p><strong>Data:</strong> {order.createdAt && new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
              <p>
                <strong>Itens:</strong>{' '}
                {order.items.map((item, index) => (
                  <span key={index} className="order-item-details">
                    {`${item.name} (Cor: ${getColorName(item.color)}, Tamanho: ${item.size}, Quantidade: ${item.quantity})`}
                  </span>
                ))}
              </p>
              <hr className="divider" />
            </li>
          ))}
        </ul>
      ) : (
        <p>Você ainda não fez nenhum pedido.</p>
      )}
    </div>
  );
};

export default MyOrders;
