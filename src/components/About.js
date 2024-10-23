// src/components/About.js
import React from 'react';
import '../style/About.css'; // Estilos para o componente
import logo from '../assets/logo.jpg'; // Caminho correto para a imagem
import hist from '../assets/sand.jpg'; // Caminho correto para a imagem
import sadil from '../assets/sandil.webp'; // Caminho correto para a imagem
import Footer from './Footer'; // Importando o Footer

const About = () => {
  return (
    <div className="about-container">
      <h1 className="about-title">Sobre Nós</h1>
      <img 
        src={logo} // Utilizando a imagem importada
        alt="Logo da Empresa"
        className="about-logo"
      />
      <div className="about-content">
        <div className='about-story'>
          
          <p className="about-text">
            Nossa história começa com uma pessoa humilde que sempre sonhou em
            oferecer os melhores calçados para sua comunidade. Com muito esforço e 
            dedicação, ele começou a vender calçados em uma pequena loja na esquina 
            da cidade. Cada par de sapatos que ele vendia era escolhido a dedo, 
            garantindo qualidade e conforto para seus clientes.
          </p>
          <div></div>
          <img 
            src={hist} // Utilizando a imagem importada
            alt="Calçados da Empresa"
            className="about-image"
          />
        </div>

        <p className="about-text">
            Ao longo dos anos, sua paixão e compromisso o levaram a expandir seus 
            negócios. Hoje, temos orgulho de oferecer uma variedade de calçados que 
            atendem a todos os estilos e necessidades. Acreditamos que cada cliente 
            merece o melhor, e estamos aqui para ajudar a encontrar o par perfeito.
          </p>  
         

        <div className='about-storys'>
          <p className="about-text">
              Junte-se a nós em nossa jornada e descubra a qualidade e o conforto dos 
              nossos produtos. Estamos aqui para fazer você se sentir bem a cada passo 
              que der!
            </p>
          <img 
              src={sadil} // Utilizando a imagem importada
              alt="Calçados da Empresa"
              className="about-images"
            />
          
         
        </div>
         
       
      </div>

      { /* Footer será renderizado aqui */}
    <Footer /> 
    </div>
  );
};

export default About;
