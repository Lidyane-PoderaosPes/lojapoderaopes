import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; // Firestore imports
import { Form, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../data/firebaseConfig'; // Firebase authentication and Firestore
import InputMask from 'react-input-mask'; // Importando o InputMask

import '../../style/Register.css';

const RegisterForm = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [Firstname, setFirstName] = useState(''); // Nome
  const [Secondname, setSecondName] = useState(''); // Sobrenome
  const [cpf, setCpf] = useState(''); // CPF
  const [cep, setCep] = useState(''); // CEP
  const [address, setAddress] = useState(''); // Endereço
  const [phone, setPhone] = useState(''); // Telefone/WhatsApp
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // Estado para o modal
  const [termsAccepted, setTermsAccepted] = useState(false); // Estado para o checkbox de termos
  const navigate = useNavigate(); // Inicializar o useNavigate

  // Função de registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!termsAccepted) {
      setError('Você precisa aceitar os Termos e Condições.');
      return;
    }


    if (password !== confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }

    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualizar o perfil do usuário com o nome (displayName)
      await updateProfile(user, { displayName: Firstname });

      // Salvar informações adicionais no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        Firstname: Firstname,
        Secondname: Secondname,
        cpf: cpf,
        cep: cep,
        address: address,
        phone: phone, // Adicionando o telefone/WhatsApp
        email: email,
      });

      // Aqui você pode enviar outros dados para o backend, se necessário
      alert('Usuário registrado com sucesso!');
      onRegister(user); // Chama a função de callback com o usuário

      // Redirecionar para outra página
      navigate('/cart');
    } catch (error) {
      setError('Erro ao registrar: ' + error.message);
    }
  };

  return (
    <>
    <Form onSubmit={handleRegister} className="auth-form">
      <Form.Group controlId="formName">
        <Form.Label>Primeiro nome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Digite seu primeiro nome"
          value={Firstname}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formSecondname">
        <Form.Label>Sobrenome</Form.Label>
        <Form.Control
          type="text"
          placeholder="Digite seu sobrenome"
          value={Secondname}
          onChange={(e) => setSecondName(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formCpf">
        <Form.Label>CPF</Form.Label>
        <InputMask
          mask="999.999.999-99"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="Digite seu CPF"
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formCep">
        <Form.Label>CEP</Form.Label>
        <InputMask
          mask="99999-999"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Digite seu CEP"
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formAddress">
        <Form.Label>Endereço</Form.Label>
        <Form.Control
          type="text"
          placeholder="Digite seu endereço"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formPhone">
        <Form.Label>Telefone/WhatsApp</Form.Label>
        <Form.Control
          type="text"
          placeholder="Digite seu telefone ou WhatsApp"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formEmailRegister">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formPasswordRegister">
        <Form.Label>Senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

      <Form.Group controlId="formConfirmPassword">
        <Form.Label>Confirme sua senha</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>

        {/* Outros campos... */}
        {/* Adicionando Checkbox de Termos e Botão para abrir o modal */}
        <Form.Group className="mt-3">
          <Form.Check
            type="checkbox"
            label="Concordo com os Termos e Condições"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
          />
          <Button
            variant="link"
            className="p-0 text-primary"
            onClick={() => setShowModal(true)}
          >
            Leia os Termos
          </Button>
        </Form.Group>

      {error && <p className="text-danger">{error}</p>}

      <Button variant="success" type="submit" className="register-btn mt-3">
        Registrar
      </Button>
    </Form>

    {/* Modal de Termos e Condições */}
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>Termos e Condições</Modal.Title>
    </Modal.Header>
    <Modal.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <p>Bem-vindo(a) ao nosso site! Leia com atenção os termos e condições antes de se registrar.</p>
      <p>1. Você concorda em fornecer informações precisas e verdadeiras durante o registro.</p>
      <p>2. Seus dados pessoais serão utilizados apenas para melhorar sua experiência em nossa plataforma.</p>
      <p>3. Garantimos a segurança das suas informações de acordo com as normas vigentes.</p>
      <p>...</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Fechar
      </Button>
    </Modal.Footer>
    </Modal>
  </>
  );
};

export default RegisterForm;
