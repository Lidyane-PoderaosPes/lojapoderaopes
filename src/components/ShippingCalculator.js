import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import '../style/ShippingCalculator.css'; // Importe um arquivo CSS personalizado para estilização

const ShippingCalculator = ({ cartItems, setShippingCost }) => {
  const [zipCode, setZipCode] = useState('');
  const [shippingCost, setCost] = useState(0);

  // Simula o cálculo do frete baseado no CEP e no peso total dos itens
  const calculateShipping = () => {
    if (!zipCode) {
      alert('Por favor, insira um CEP válido.');
      return;
    }
    
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 1) * item.quantity, 0);
    const baseCost = 10; // Custo base de envio
    const additionalCostPerKg = 5; // Custo adicional por kg
    
    // Simulação do cálculo do frete (ajuste conforme necessário)
    const calculatedCost = baseCost + (totalWeight * additionalCostPerKg);
    setCost(calculatedCost);
    setShippingCost(calculatedCost);
  };

  return (
    <div className="shipping-calculator mt-4">
      <h5>Calcular Frete</h5>
      <Form.Group controlId="formZipCode">
        <Form.Label>CEP:</Form.Label>
        <Form.Control 
          type="text"
          placeholder="Insira seu CEP"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
        />
      </Form.Group>
      <Button variant="secondary" onClick={calculateShipping} className="mt-2">
        Calcular Frete
      </Button>
      {shippingCost > 0 && (
        <p className="mt-3">Custo do Frete: R$ {shippingCost.toFixed(2)}</p>
      )}
    </div>
  );
};

export default ShippingCalculator;
