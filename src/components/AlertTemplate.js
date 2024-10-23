// src/AlertTemplate.js
import React from 'react';

// Componente de template de alerta
const AlertTemplate = ({ message, options, style, close }) => {
  return (
    <div
      style={{
        ...style,
        padding: '20px',
        borderRadius: '5px',
        background: '#f8d7da', // Cor de fundo (vermelho claro)
        color: '#721c24', // Cor do texto (vermelho escuro)
        display: 'flex', // Flex para alinhar o conteúdo
        justifyContent: 'space-between', // Espaço entre a mensagem e o botão
        alignItems: 'center', // Centraliza verticalmente
        margin: '10px 0', // Margem superior e inferior
        border: '1px solid #f5c6cb', // Borda para o alerta
        position: 'relative', // Posicionamento relativo para o botão
      }}
    >
      <span>{message}</span> {/* Mensagem do alerta */}
      <button
        onClick={close} // Fecha o alerta ao clicar
        style={{
          marginLeft: '10px',
          background: 'none', // Sem fundo
          border: 'none', // Sem borda
          color: '#721c24', // Cor do botão de fechar
          cursor: 'pointer', // Cursor em forma de ponteiro
          fontSize: '16px', // Tamanho da fonte
        }}
      >
        Fechar
      </button>
    </div>
  );
};

export default AlertTemplate;
