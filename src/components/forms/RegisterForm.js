import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; // Firestore imports
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../data/firebaseConfig'; // Firebase authentication and Firestore
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
  const navigate = useNavigate(); // Inicializar o useNavigate

  // Função de registro
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

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
        <Form.Control
          type="text"
          placeholder="Digite seu CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
          className="auth-input"
        />
      </Form.Group>
      <Form.Group controlId="formCep">
        <Form.Label>CEP</Form.Label>
        <Form.Control
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
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
      {error && <p className="text-danger">{error}</p>}
      <Button variant="success" type="submit" className="register-btn mt-3">
        Registrar
      </Button>
    </Form>
  );
};

export default RegisterForm;
