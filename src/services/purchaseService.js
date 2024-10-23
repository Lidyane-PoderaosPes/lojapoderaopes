import { db } from '../data/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Use diretamente o getAuth se precisar


// Função para salvar a compra no Firestore
export const savePurchase = async (userId, cartItems) => {
  try {
    // Referência à coleção "purchases" no Firestore
    const purchasesCollection = collection(db, 'purchases');
    
    // Adiciona um novo documento com o userId e os itens do carrinho
    const purchaseDoc = await addDoc(purchasesCollection, {
      userId,       // ID do usuário logado
      items: cartItems,  // Itens do carrinho
      timestamp: new Date(),  // Data e hora da compra
    });

    console.log('Compra salva com sucesso com ID:', purchaseDoc.id);
  } catch (error) {
    console.error('Erro ao salvar a compra:', error);
    throw error; // Lança o erro para o componente lidar com a falha
  }
};
