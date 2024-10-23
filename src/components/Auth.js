import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../data/firebaseConfig';
import { Container, Form, Button, Tab, Tabs } from 'react-bootstrap';
import '../style/Auth.css';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/forms/RegisterForm';
import { Alert } from 'react-bootstrap';
import Footer from './Footer'; // Importando o Footer

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState(''); // 'success' ou 'danger' para estilo do alerta

  // Função de login
const handleLogin = async (e) => {
  e.preventDefault();
  setError(''); // Limpa erros anteriores
  setShowAlert(false); // Esconde qualquer alerta anterior

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mostrar alerta de sucesso
    setAlertMessage('Bem-vindo!');
    setAlertVariant('success');
    setShowAlert(true);

    // Chama a função de callback com o usuário
    onLogin(user);

    // Verificar se o e-mail é "adm@adm.com" e redirecionar adequadamente
    if (user.email === 'adm@adm.com') {
      setTimeout(() => {
        navigate('/add-product'); // Redireciona para a página de adicionar produto após mostrar alerta
      }, 1000); // Redireciona após 1 segundo para permitir que o alerta seja visível
    } else {
      setTimeout(() => {
        navigate('/cart'); // Redireciona para a página do carrinho
      }, 1000); // Redireciona após 1 segundo
    }

  } catch (error) {
    // Em caso de erro, exibe mensagem no alerta
    setError('Erro ao fazer login: ' + error.message);
    setAlertMessage('Erro ao fazer login: ' + error.message);
    setAlertVariant('danger');
    setShowAlert(true);
  }
};

  

  return (
    <>
      <Container className="auth-container mt-5">
      <div className="auth-card">
        <h1 className="auth-title">Bem-vinda à Sua Loja de Calçados!</h1>
        
        {/* Alerta de sucesso ou erro */}
        {showAlert && (
          <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
            {alertMessage}
          </Alert>
        )}
  
        <Tabs
          activeKey={isLogin ? 'login' : 'register'}
          onSelect={(k) => setIsLogin(k === 'login')}
          className="auth-tabs"
        >
          <Tab eventKey="login" title="Login">
            <Form onSubmit={handleLogin} className="auth-form">
              <Form.Group controlId="formEmail">
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
              <Form.Group controlId="formPassword">
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
              {error && <p className="text-danger">{error}</p>}
              <Button variant="primary" type="submit" className="login-btn mt-3">
                Entrar
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Registrar">
            <RegisterForm onRegister={onLogin} />
          </Tab>
        </Tabs>
      </div>
    </Container>
    { /* Footer será renderizado aqui */}
    <Footer /> 
    </>
  
  );
  
};

export default Auth;
