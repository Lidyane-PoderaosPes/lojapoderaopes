import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
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
    currentPassword: '', // Para senha atual
    newPassword: '', // Para nova senha
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
          ...formData,
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
      } else {
        setError('Erro ao atualizar dados. Usuário não encontrado.');
      }

      // Alterar a senha se os campos de senha forem preenchidos
      if (formData.currentPassword && formData.newPassword) {
        const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);

        // Reautenticar o usuário
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Atualizar a senha
        await updatePassword(auth.currentUser, formData.newPassword);
        setSuccess('Dados e senha atualizados com sucesso!');
      } else {
        setSuccess('Dados atualizados com sucesso!');
      }

      if (onUpdate) onUpdate(); // Atualiza os dados no componente pai
    } catch (err) {
      setError('Erro ao salvar os dados. Verifique suas informações e tente novamente.');
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
              disabled={field === 'email' || field === 'cpf'} // Email e CPF não podem ser editados
            />
          </div>
        ))}

        {/* Campos de senha */}
        <div className="form-group">
          <label htmlFor="currentPassword">SENHA ATUAL</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            className="form-control"
            value={formData.currentPassword}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">NOVA SENHA</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className="form-control"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>

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
