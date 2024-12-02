import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../data/firebaseConfig';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../style/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (!email) {
        setError('Por favor, insira seu e-mail.');
        setLoading(false);
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage('E-mail de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (error) {
      setError('Erro ao enviar e-mail de redefinição de senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth'); // Ajuste a rota conforme necessário
  };

  return (
    <Container className="forgot-password-container">
      <div className="forgot-password-card">
        <h1 className="forgot-password-title">Esqueceu sua senha?</h1>
        <p>Insira o seu e-mail abaixo e enviaremos um link para redefinir sua senha.</p>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handlePasswordReset} className="forgot-password-form">
          <Form.Group controlId="formEmail">
            <Form.Control
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </Button>
        </Form>

        <Button 
        onClick={handleBackToLogin} 
        className="forgot-password-back-btn"
        >
        Voltar para o Login
        </Button>

      </div>
    </Container>
  );
};

export default ForgotPassword;
