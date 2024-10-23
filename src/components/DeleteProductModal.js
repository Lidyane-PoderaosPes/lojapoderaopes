import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteProductModal = ({ show, handleClose, product, handleDelete }) => (
  <Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Confirmar Exclusão</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Tem certeza de que deseja excluir o produto "{product?.name}"?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Cancelar
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Excluir
      </Button>
    </Modal.Footer>
  </Modal>
);

export default DeleteProductModal;
