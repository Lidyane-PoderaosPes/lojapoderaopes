// src/components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import '../style/NotFound.css'; // Certifique-se de que o caminho está correto

const NotFound = () => {
  return (
    <Container className="not-found-container text-center mt-5">
      <h1 className="not-found-title">404 - Página Não Encontrada</h1>
      <p className="not-found-message">Desculpe, mas a página que você está procurando não existe.</p>
      <Link to="/">
        <Button variant="primary" className="not-found-btn">
          Voltar para a Página Inicial
        </Button>
      </Link>
    </Container>
  );
};

export default NotFound;
