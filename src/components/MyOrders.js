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

const groupOrdersByMonth = (orders) => {
  return orders.reduce((acc, order) => {
    const date = new Date(order.createdAt.seconds * 1000);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(order);

    return acc;
  }, {});
};

const MyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const purchasesRef = collection(db, 'purchases');
          const q = query(purchasesRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          const fetchedOrders = querySnapshot.docs.map((doc) => ({
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

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  const groupedOrders = groupOrdersByMonth(orders);

  return (
    <div className="orders-container">
      <h2>Meus Pedidos</h2>
      {Object.keys(groupedOrders).length > 0 ? (
        Object.entries(groupedOrders).map(([month, monthOrders]) => (
          <div key={month} className="month-orders">
            <h3 className="month-title" onClick={() => toggleMonth(month)}>
              {month} ({monthOrders.length} pedidos)
            </h3>
            {expandedMonths[month] && (
             <ul className="orders-list">
              {monthOrders.map((order) => (
                <li key={order.id} className="order-item">
                  <p>
                    <strong>Itens:</strong>{' '}
                    {order.items.map((item, index) => (
                      <span key={index} className="order-item-details">
                        {`${item.name} (Cor: ${getColorName(item.color)}, Tamanho: ${item.size}, Quantidade: ${item.quantity})`}
                      </span>
                    ))}
                  </p>
                  <div className="order-row">
                    <p><strong>Total:</strong> R$ {parseFloat(order.total).toFixed(2)}</p>
                    <p><strong>Método de Pagamento:</strong> {order.paymentMethod}</p>
                  </div>
                  <div className="order-row">
                    <p><strong>Data:</strong> {new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
                    <p><strong>Status:</strong> {order.status || 'Pendente'}</p>
                  </div>
                  <hr className="divider" />
                </li>
              ))}
           </ul>
           
            )}
          </div>
        ))
      ) : (
        <p>Você ainda não fez nenhum pedido.</p>
      )}
    </div>
  );
};

export default MyOrders;
