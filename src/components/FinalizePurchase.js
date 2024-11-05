import React, { useEffect, useState } from 'react';
import { Button, Form, Toast, Spinner, Modal } from 'react-bootstrap';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../data/firebaseConfig';
import emailjs from 'emailjs-com';

const PixPayment = () => (
  <div>
    <h5>Pagamento via Pix</h5>
    <p>Use o código Pix abaixo ou escaneie o QR code:</p>
    <p><strong>Código Pix:</strong> 1234567890</p>
  </div>
);

const BankTransferPayment = () => (
  <div>
    <h5>Transferência Bancária</h5>
    <p>Transfira o valor para a conta abaixo:</p>
    <p><strong>Banco:</strong> 000 - Nome do Banco</p>
    <p><strong>Agência:</strong> 1234</p>
    <p><strong>Conta:</strong> 56789-0</p>
    <p>Envie o comprovante por e-mail ou diretamente no sistema após a transferência.</p>
  </div>
);

const BoletoPayment = () => (
  <div>
    <h5>Boleto Bancário</h5>
    <p>Um boleto será gerado ao finalizar a compra. Você poderá pagá-lo em qualquer banco ou lotérica.</p>
  </div>
);

const DigitalWalletPayment = () => (
  <div>
    <h5>Carteiras Digitais (PicPay, Mercado Pago)</h5>
    <p>Transfira o valor para a nossa conta na carteira digital:</p>
    <p><strong>Usuário:</strong> @nomeusuario</p>
  </div>
);

const FinalizePurchase = ({ user, cartItems, calculateTotal, setCartItems }) => {
  const [userData, setUserData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            setUserData(userSnapshot.data());
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      setToastMessage('Por favor, selecione um comprovante.');
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    const storageRef = ref(storage, `receipts/${user.uid}/${receiptFile.name}`);
    try {
      await uploadBytes(storageRef, receiptFile);
      const receiptURL = await getDownloadURL(storageRef);
      finalizePurchase(receiptURL);
    } catch (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      setToastMessage('Erro ao fazer upload do comprovante.');
      setShowToast(true);
    } finally {
      setIsUploading(false);
      setShowModal(false);
    }
  };

  const finalizePurchase = async (receiptURL = '') => {
    if (!paymentMethod) {
      setToastMessage('Por favor, selecione um método de pagamento.');
      setShowToast(true);
      return;
    }

    if (userData) {
      setIsProcessing(true);
      try {
        const purchaseData = {
          userId: user.uid,
          userName: `${userData.Firstname} ${userData.Secondname}`,
          email: userData.email,
          phone: userData.phone,
          items: cartItems,
          total: calculateTotal(),
          address: userData.address || 'Endereço não fornecido',
          cep: userData.cep || 'CEP não fornecido',
          cpf: userData.cpf || 'CPF não fornecido',
          createdAt: new Date(),
          paymentMethod: paymentMethod,
          receiptURL: receiptURL
        };

        await addDoc(collection(db, 'purchases'), purchaseData);
        sendEmailToOwner(purchaseData);

        setToastMessage(`Compra finalizada com sucesso! Total: R$ ${calculateTotal()}`);
        setShowToast(true);
        setCartItems([]);
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Erro ao finalizar a compra:', error);
        setToastMessage('Erro ao finalizar a compra. Tente novamente.');
        setShowToast(true);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setToastMessage('Você precisa estar logado para finalizar a compra.');
      setShowToast(true);
    }
  };

  const sendEmailToOwner = (purchaseDetails) => {
    const emailParams = {
      to_name: 'Dono do Site',
      from_name: purchaseDetails.userName,
      user_email: purchaseDetails.email,
      phone: purchaseDetails.phone,
      items: purchaseDetails.items.map(item => `${item.name} (Cor: ${item.color}, Quantidade: ${item.quantity})`).join(',\n'),
      total: purchaseDetails.total,
      address: purchaseDetails.address,
      cep: purchaseDetails.cep,
      cpf: purchaseDetails.cpf,
      purchase_date: purchaseDetails.createdAt.toLocaleString(),
      receipt_url: purchaseDetails.receiptURL
    };

    emailjs.send('service_9vea3bn', 'template_eujkp9a', emailParams, 'RdguVRT_gwVL0_gAh')
      .then(response => {
        console.log('E-mail enviado com sucesso!', response.status, response.text);
      })
      .catch(error => {
        console.error('Erro ao enviar o e-mail:', error);
      });
  };

  return (
    <div>
      <h3>Finalizar Compra</h3>
      <p>Escolha o método de pagamento:</p>
      <Form.Select onChange={(e) => setPaymentMethod(e.target.value)} value={paymentMethod}>
        <option value="">Selecione...</option>
        <option value="pix">Pix</option>
        <option value="bankTransfer">Transferência Bancária</option>
        <option value="boleto">Boleto Bancário</option>
        <option value="digitalWallet">Carteira Digital</option>
      </Form.Select>

      <div style={{ marginTop: '20px' }}>
        {paymentMethod === 'pix' && <PixPayment />}
        {paymentMethod === 'bankTransfer' && <BankTransferPayment />}
        {paymentMethod === 'boleto' && <BoletoPayment />}
        {paymentMethod === 'digitalWallet' && <DigitalWalletPayment />}
      </div>

      {paymentMethod === 'bankTransfer' && (
        <Button onClick={() => setShowModal(true)} style={{ marginTop: '20px' }}>Enviar Comprovante</Button>
      )}

      <Button
        className="botao-purchase"
        onClick={() => finalizePurchase()}
        style={{ marginTop: '20px' }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Spinner animation="border" size="sm" />
        ) : (
          'Finalizar Compra'
        )}
      </Button>

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload de Comprovante</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Selecione o arquivo do comprovante</Form.Label>
            <Form.Control type="file" onChange={(e) => setReceiptFile(e.target.files[0])} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleReceiptUpload} disabled={isUploading}>
            {isUploading ? <Spinner animation="border" size="sm" /> : 'Enviar Comprovante'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FinalizePurchase;
