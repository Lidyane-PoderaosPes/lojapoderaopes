import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';

const MyOrders = ({ user }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(fetchedOrders);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="orders-container">
      <h2>Meus Pedidos</h2>
      {orders.length > 0 ? (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              Pedido: {order.id}, Total: {order.total} - Status: {order.status}
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
