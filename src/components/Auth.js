import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../data/firebaseConfig';
import { Container, Form, Button, Tab, Tabs, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/forms/RegisterForm';
import Footer from './Footer'; // Importando o Footer
import '../style/Auth.css';

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState(''); // 'success' ou 'danger' para estilo do alerta
  const navigate = useNavigate();

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setShowAlert(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      setAlertMessage('Bem-vindo!');
      setAlertVariant('success');
      setShowAlert(true);

      onLogin(user);

      if (user.email === 'adm@adm.com') {
        setTimeout(() => navigate('/add-product'), 1000);
      } else {
        setTimeout(() => navigate('/cart'), 1000);
      }
    } catch (error) {
      setError('Erro ao fazer login: ' + error.message);
      setAlertMessage('Erro ao fazer login: ' + error.message);
      setAlertVariant('danger');
      setShowAlert(true);
    }
  };

  // Função para enviar e-mail de redefinição de senha
  const handleForgotPassword = async () => {
    setShowAlert(false);
    try {
      if (!email) {
        setAlertMessage('Por favor, insira o e-mail para redefinir a senha.');
        setAlertVariant('danger');
        setShowAlert(true);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setAlertMessage('E-mail de redefinição de senha enviado com sucesso!');
      setAlertVariant('success');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage('Erro ao enviar e-mail de redefinição de senha: ' + error.message);
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
                <Button
                  variant="link"
                  onClick={() => navigate('/ForgotPassword')}
                  className="forgot-password-btn mt-2"
                >
                  Esqueceu a senha?
                </Button>

              </Form>
            </Tab>
            <Tab eventKey="register" title="Registrar">
              <RegisterForm onRegister={onLogin} />
            </Tab>
          </Tabs>
        </div>
      </Container>
      {/* Footer será renderizado aqui */}
      <Footer />
    </>
  );
};

export default Auth;
