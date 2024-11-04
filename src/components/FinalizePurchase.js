import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import emailjs from 'emailjs-com';

const FinalizePurchase = ({ user, cartItems, calculateTotal, setCartItems }) => {
  const [userData, setUserData] = useState(null);

  // Mapeamento de cores em hexadecimal para nomes
  const colorNames = {
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserData(userData);
            console.log('Dados do usuário:', userData);
          } else {
            console.log('Nenhum documento encontrado para este usuário.');
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const finalizePurchase = async () => {
    if (userData) {
      console.log('Informações do usuário logado:');
      
      try {
        const userAddress = `${userData.address || 'Endereço não fornecido'}`;
        const userAddressCep = `CEP: ${userData.cep || 'CEP não fornecido'}`;
        const userCpf = userData.cpf || 'CPF não fornecido';
        const userName = `${userData.Firstname || 'Nome não fornecido'} ${userData.Secondname || 'Sobrenome não fornecido'}`;
        const userPhone = userData.phone || 'Telefone não fornecido';

        await addDoc(collection(db, 'purchases'), {
          userId: user.uid,
          userName: userName,
          email: userData.email || 'E-mail não fornecido',
          phone: userPhone,
          items: cartItems,
          total: calculateTotal(),
          address: userAddress,
          cep: userAddressCep,
          cpf: userCpf,
          createdAt: new Date(),
        });

        sendEmailToOwner({
          userName: userName,
          userEmail: userData.email,
          phone: userPhone,
          items: cartItems,
          total: calculateTotal(),
          address: userAddress,
          cep: userAddressCep,
          cpf: userCpf,
          purchaseDate: new Date().toLocaleString(),
        });

        alert(`Compra finalizada com sucesso! Total: R$ ${calculateTotal()}`);
        setCartItems([]);
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Erro ao finalizar a compra:', error);
        alert('Erro ao finalizar a compra. Tente novamente.');
      }
    } else {
      alert('Você precisa estar logado para finalizar a compra.');
    }
  };

  const sendEmailToOwner = (purchaseDetails) => {
    const emailParams = {
      to_name: 'Dono do Site',
      from_name: purchaseDetails.userName,
      user_email: purchaseDetails.userEmail,
      phone: purchaseDetails.phone, // Adicionando o telefone ao e-mail
      items: purchaseDetails.items.map(item => {
        const colorName = colorNames[item.color] || item.color || 'não especificada';
        return `${item.name} (Cor: ${colorName}, Tamanho: ${item.size || 'não especificado'}, Quantidade: ${item.quantity})`;
      }).join(',\n'),
      total: purchaseDetails.total,
      address: purchaseDetails.address,
      cep: purchaseDetails.cep,
      cpf: purchaseDetails.cpf,
      purchase_date: purchaseDetails.purchaseDate,
    };

    emailjs.send('service_9vea3bn', 'template_eujkp9a', emailParams, 'RdguVRT_gwVL0_gAh')
      .then((response) => {
        console.log('E-mail enviado com sucesso!', response.status, response.text);
        alert('O e-mail foi enviado com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao enviar o e-mail:', error);
        alert('Erro ao enviar o e-mail. Por favor, tente novamente.');
      });
  };

  return (
    <Button className="botao-purchase" onClick={finalizePurchase} style={{ display: 'flex' }}>
      Finalizar Compra
    </Button>
  );
};

export default FinalizePurchase;
