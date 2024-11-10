import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { db } from '../data/firebaseConfig'; // Certifique-se de que o caminho está correto
import { doc, getDoc } from 'firebase/firestore'; // Para acessar o Firestore
import '../style/ShippingCalculator.css'; // Importe um arquivo CSS personalizado para estilização

const ShippingCalculator = ({ cartItems, setShippingCost, user }) => {
  const [shippingCost, setCost] = useState(0);
  const [userCep, setUserCep] = useState(''); // Estado para armazenar o CEP do usuário

  // Coordenadas de Brasília (saída)
  const brasiliaCoordinates = { lat: -15.76790, lon: -47.78202 };

  // Função para obter as coordenadas de um CEP usando Nominatim (OpenStreetMap)
  const getCoordinatesFromZipCode = async (zipCode) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${zipCode}&format=json`);
    const data = await response.json();
    if (data && data[0]) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null; // Caso não encontre as coordenadas
  };

  // Função para calcular a distância usando a API OSRM
  const getDistanceFromBrasilia = async (zipCode) => {
    const destination = await getCoordinatesFromZipCode(zipCode);

    if (!destination) {
      alert('Não foi possível obter as coordenadas do CEP.');
      return null;
    }

    // Usar a API OSRM para calcular a distância entre Brasília e o destino
    const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${brasiliaCoordinates.lon},${brasiliaCoordinates.lat};${destination.lon},${destination.lat}?overview=false`);
    const data = await response.json();
    if (data.routes && data.routes[0]) {
      return data.routes[0].legs[0].distance / 1000; // Distância em quilômetros
    }
    return null;
  };

  // Função para obter os dados do usuário (incluindo o CEP) do Firestore
  const getUserData = async (uid) => {
    if (uid) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserCep(userData?.cep || ''); // Armazenar o CEP do usuário no estado
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      }
    }
  };

  useEffect(() => {
    if (user?.uid) {
      getUserData(user.uid); // Buscar os dados do usuário ao montar o componente
    }
  }, [user]);

  // Simula o cálculo do frete baseado no CEP, distância e peso total dos itens
  const calculateShipping = async () => {
    const zipCode = userCep || ''; // Usando o CEP do usuário logado

    if (!zipCode) {
      alert('Por favor, insira um CEP válido.');
      return;
    }

    // Calcular a distância entre o CEP e Brasília
    const distance = await getDistanceFromBrasilia(zipCode);

    if (!distance) {
      alert('Não foi possível calcular a distância. Tente novamente.');
      return;
    }

    // Calcular o peso total dos itens no carrinho
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);

    const baseCost = 5; // Custo base de envio
    const additionalCostPerKm = 0.01; // Reduzido de 0.5 para diminuir o impacto da distância
    const additionalCostPerKg = 1; // Reduzido de 5 para reduzir o custo com peso

    // Calcular o custo baseado na distância
    const distanceCost = distance * additionalCostPerKm;
    
    // Definir um limite máximo para o custo de envio baseado na distância (por exemplo, R$ 200,00)
    const maxDistanceCost = 200; // Limite de custo de distância
    const finalDistanceCost = distanceCost > maxDistanceCost ? maxDistanceCost : distanceCost;

    // Simulação do cálculo do frete
    const calculatedCost = baseCost + finalDistanceCost + (totalWeight * additionalCostPerKg);
    setCost(calculatedCost);
    setShippingCost(calculatedCost);
  };

  return (
    <div className="shipping-calculator mt-4">
      <h5>Calcular Frete</h5>
      <Form.Group controlId="formZipCode">
        <Form.Label>CEP: {userCep || '00000-000'}</Form.Label>
        <Form.Control 
          type="text"
          value={userCep}
          disabled // Desabilita o campo para que o usuário não possa alterar o CEP
        />
      </Form.Group>
      <button 
        onClick={calculateShipping} 
        onTouchStart={calculateShipping} // Adiciona suporte para toque em dispositivos móveis
        className="shipping-button"
      >
        Calcular Frete
      </button>


      {shippingCost > 0 && (
        <p className="mt-3">Custo do Frete: R$ {shippingCost.toFixed(2)}</p>
      )}
    </div>
  );
};

export default ShippingCalculator;
