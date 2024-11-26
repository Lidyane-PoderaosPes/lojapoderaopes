import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../data/firebaseConfig';
import Spinner from 'react-bootstrap/Spinner'; // Para exibir carregamento
import '../style/EditProfile.css'; // Arquivo CSS para estilos personalizados

const EditProfile = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    cep: '',
    cpf: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(true); // Estado inicial de carregamento
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Função para carregar os dados do usuário do Firestore
  const loadUserData = async () => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setFormData({
          firstName: userData.Firstname || '',
          lastName: userData.Secondname || '',
          address: userData.address || '',
          cep: userData.cep || '',
          cpf: userData.cpf || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });
      } else {
        setError('Usuário não encontrado no banco de dados.');
      }
    } catch (err) {
      setError('Erro ao carregar dados do usuário.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const auth = getAuth();
    try {
      // Atualizar dados no Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      // Atualizar os outros dados no Firestore
      const q = query(collection(db, 'users'), where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, 'users', userDoc.id);
        await updateDoc(userRef, {
          Firstname: formData.firstName,
          Secondname: formData.lastName,
          address: formData.address,
          cep: formData.cep,
          cpf: formData.cpf,
          phone: formData.phone,
        });
        setSuccess('Dados atualizados com sucesso!');
        if (onUpdate) onUpdate(); // Atualiza os dados no componente pai
      } else {
        setError('Erro ao atualizar dados. Usuário não encontrado.');
      }
    } catch (err) {
      setError('Erro ao salvar os dados. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <h3 className="edit-profile-title">Editar Perfil</h3>
      <form onSubmit={handleSave} className="edit-profile-form">
        {['firstName', 'lastName', 'address', 'cep', 'cpf', 'email', 'phone'].map((field) => (
          <div key={field} className="form-group">
            <label htmlFor={field}>{field.toUpperCase()}</label>
            <input
              type="text"
              id={field}
              name={field}
              className="form-control"
              value={formData[field]}
              onChange={handleChange}
              required={field !== 'email'} // Email é apenas leitura
              disabled={field === 'email'|| field === 'cpf'} // Email não pode ser editado
              
            />
          </div>
        ))}

        {/* Feedback */}
        {error && <p className="text-danger">{error}</p>}
        {success && <p className="text-success">{success}</p>}

        {/* Botão de envio */}
        <button type="submit" className="edit-user" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
