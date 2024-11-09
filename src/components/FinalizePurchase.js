import React, { useEffect, useState } from 'react';
import { Button, Form, Toast, Spinner, Modal } from 'react-bootstrap';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../data/firebaseConfig';
import emailjs from 'emailjs-com';
import qrCodePix from '../assets/qrcode-pix.png'; // Importe a imagem do QR code

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

// Função para buscar o nome da cor pelo código hexadecimal
const getColorName = (hexCode) => colorNames[hexCode] || hexCode;

const PixPayment = () => (
  <div>
    <p>Use o código Pix abaixo ou escaneie o QR code:</p>
    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>   
      <p style={{ justifyContent: 'center' }}><strong>Chave Pix:</strong> 77981212251</p>
      <img src={qrCodePix} alt="QR code Pix" style={{ width: '150px', height: '150px' }} />
    </div>
    <p><strong>Tipo de Chave:</strong> Telefone </p>
    <p><strong>Nome:</strong> Lidyane de jesus Gonçalve</p>
  </div>
);

const BankTransferPayment = () => (
  <div>

    <p>Transfira o valor para a conta abaixo:</p>
    <p><strong>Banco:</strong> 0260 - Nu Pagamentos S.A. - Instituição de Pagamento</p>
    <p><strong>Tipo de conta:</strong> Conta Corrente</p>
    <p><strong>Cpf:</strong> 00532696166</p>
    <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
      <p><strong>Agência:</strong> 0001</p>
      <p><strong>Conta:</strong> 87634228-3</p>
    </div> 
    <p>Envie o comprovante por e-mail ou diretamente no sistema após a transferência.</p>
  </div>
);

const BoletoPayment = () => (
  <div>
    <h5>Boleto Bancário</h5>
    <p>Um boleto será gerado ao finalizar a compra. Você poderá pagá-lo em qualquer banco ou lotérica.</p>
    <p><strong>Indisponível no Momento</strong></p>
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
  const [boletoURL, setBoletoURL] = useState('');

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

  const handleReceiptUpload = async (file) => {
    if (!file) {
      setToastMessage('Por favor, selecione um comprovante.');
      setShowToast(true);
      return;
    }
  
    setIsUploading(true);
    const storageRef = ref(storage, `receipts/${user.uid}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const receiptURL = await getDownloadURL(storageRef);
      finalizePurchase(receiptURL);
    } catch (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      setToastMessage('Erro ao fazer upload do comprovante.');
      setShowToast(true);
    } finally {
      setIsUploading(false);
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
        let generatedBoletoURL = '';
    
        // Verifique se o método de pagamento é boleto
        if (paymentMethod === 'boleto') {
          generatedBoletoURL = 'https://exemplo.com/boleto-gerado';
        }
    
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
          receiptURL: receiptURL,
          boletoURL: generatedBoletoURL // Passe o URL diretamente aqui
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
      items: purchaseDetails.items
      .map(item => 
        `${item.name} (Cor: ${getColorName(item.color)}, Tamanho: ${item.size}, Quantidade: ${item.quantity})`
      ).join(',\n'),
      total: purchaseDetails.total,
      address: purchaseDetails.address,
      cep: purchaseDetails.cep,
      cpf: purchaseDetails.cpf,
      purchase_date: purchaseDetails.createdAt.toLocaleString(),
      payment_method: paymentMethod,
      receipt_url: purchaseDetails.receiptURL,
      boleto_url: purchaseDetails.boletoURL
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
        {/*{paymentMethod === 'boleto' && <BoletoPayment />}
        {paymentMethod === 'digitalWallet' && <DigitalWalletPayment />}*/}
      </div>

      {(paymentMethod === 'bankTransfer' || paymentMethod === 'pix') && (
        <div style={{ marginTop: '20px' }}>
          <Form.Group controlId="formFile">
            <Form.Label>Envie o comprovante:</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => {
                setReceiptFile(e.target.files[0]);
                handleReceiptUpload(e.target.files[0]); // Chama o upload automaticamente ao selecionar o arquivo
              }}
            />
          </Form.Group>
          {isUploading && (
            <div style={{ marginTop: '10px' }}>
              <Spinner animation="border" size="sm" />
              <span style={{ marginLeft: '8px' }}>Carregando comprovante...</span>
            </div>
          )}
        </div>
      )}

      {(paymentMethod === 'digitalWallet' || paymentMethod === 'boleto') && (
              <div style={{ marginTop: '20px' }}>
                 <p><strong>Forma de Pagamento </strong></p>
                <p><strong>Indisponível no Momento</strong></p>
              </div>
            )}


      <div className='centr'>
      <Button
          className="botao-purchases"
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
      </div>
      

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          backgroundColor: '#333',
          color: '#fff'
        }}
      >
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default FinalizePurchase;
