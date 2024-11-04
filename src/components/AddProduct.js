import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import ProductForm from '../components/forms/ProductForm'; // Importa o formulário
import '../style/AddProduct.css'; // Estilo opcional
import { getAuth } from 'firebase/auth';

const colorNames = {
  'Bege': '#F5F5DC',
  'Prata': '#C0C0C0',
  'Preto': '#000000',
  'Rosa': '#FFC0CB',
  'Azul': '#0000FF',
  'Verde': '#008000',
  'Rose': '#FF007F', // ou '#FADADD' para um tom mais claro
  'Dourado': '#FFD700',
  'Marrom': '#8B4513',
  'Pink': '#FF69B4',
  'Marsala': '#800000', // ou '#B03060' para um tom mais próximo do vinho
  'Multicolor': '#FF5733' // Exemplo de tom multicolorido; este pode variar
};

const AddProduct = () => {
  const [products, setProducts] = useState([{
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    colors: [],
    sizes: [],
    images: [], // Armazena as imagens como array
  }]);

  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState({}); // Armazena progresso individual de cada imagem
  const db = getFirestore();
  const storage = getStorage();
  const auth = getAuth();

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setProducts((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index] = { ...updatedProducts[index], [name]: value };
      return updatedProducts;
    });
  };

  const handleColorChange = (index, selectedColors) => {
    setProducts((prev) => {
      const updatedProducts = [...prev];
      updatedProducts[index] = { ...updatedProducts[index], colors: selectedColors };
      return updatedProducts;
    });
  };

  // Função para lidar com a mudança de arquivos
  const handleFileChange = (index, e) => {
    if (e.target && e.target.files) {
      setProducts((prev) => {
        const updatedProducts = [...prev];
        updatedProducts[index] = {
          ...updatedProducts[index],
          images: Array.from(e.target.files).slice(0, 3), // Limita o número de imagens a 3
        };
        return updatedProducts;
      });
    } else {
      console.error('O input de arquivo não está disponível ou não contém arquivos.');
    }
  };

  // Função para fazer o upload das imagens
  const uploadImages = async (images) => {
    const imageUrls = [];

    for (const [idx, image] of images.entries()) {
      if (!image) continue;

      const imageRef = ref(storage, `products/${image.name}`);
      const uploadTask = uploadBytesResumable(imageRef, image);

      // Processo assíncrono de upload
      const imageUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress((prevProgress) => ({
              ...prevProgress,
              [image.name]: progress,
            }));
          },
          (error) => {
            console.error('Erro no upload da imagem: ', error);
            reject(error);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          }
        );
      });

      imageUrls.push(imageUrl);
    }

    return imageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setMessage('Você precisa estar logado para adicionar um produto.');
      return;
    }

    try {
      const addedProductIds = [];

      for (const product of products) {
        const imageUrls = await uploadImages(product.images);

        // Adiciona o produto ao Firestore
        const docRef = await addDoc(collection(db, 'products'), {
          name: product.name,
          description: product.description,
          price: parseFloat(product.price),
          category: product.category,
          stock: parseInt(product.stock, 10),
          colors: product.colors || [],
          sizes: product.sizes || [],
          imageUrls: imageUrls || [], // Adiciona URLs das imagens
        });

        addedProductIds.push(docRef.id);
      }

      setMessage(`Produtos adicionados com sucesso! IDs: ${addedProductIds.join(', ')}`);
      setProducts([{
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        colors: [],
        sizes: [],
        images: [],
      }]);
      setUploadProgress({}); // Limpa progresso após upload
    } catch (error) {
      console.error('Erro ao adicionar produto: ', error);
      setMessage('Erro ao adicionar produtos. Tente novamente.');
    }
  };

  const addProductField = () => {
    setProducts([...products, {
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      colors: [],
      sizes: [],
      images: [],
    }]);
  };

  return (
    <div className="add-product-container">
      <h2 className="text-center">Cadastrar Produto</h2>
      {Object.keys(uploadProgress).length > 0 && (
        <div>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <p key={fileName}>
              Upload de {fileName}: {progress.toFixed(2)}%
            </p>
          ))}
        </div>
      )}

      <div className="row-add">
        {products.map((product, index) => (
          <div key={index} className="col-12 col-md-12 ">
            <ProductForm
              product={product}
              onChange={(e) => handleChange(index, e)}
              onFileChange={(e) => handleFileChange(index, e)}
              onColorChange={(selectedColors) => handleColorChange(index, selectedColors)}
              message={message}
              colorNames={colorNames}
            />
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="custom-btn" onClick={addProductField}>
          Outro Produto
        </button>
        <button type="submit" className="custom-btn" onClick={handleSubmit}>
          Adicionar Produtos
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
