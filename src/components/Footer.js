import React from "react";
import '../style/Footer.css'; // Arquivo CSS para personalizações adicionais

const Footer = () => {
  return (
    <footer className="footer bg-light text-dark pt-5">
      <div className="container">
        <div className="row">
          {/* Seção Sobre Nós */}
          <div className="col-md-4 mb-4">
            <h4 className="footer-title">Sobre Nós</h4>
            <p className="footer-text">
              Nossa loja de calçados femininos oferece produtos modernos e elegantes para mulheres de todos os estilos. Explore nossa coleção e encontre o par perfeito para cada ocasião.
            </p>
          </div>
          {/* Seção Links Úteis */}
          <div className="col-md-4 mb-4">
            <h4 className="footer-title">Links Úteis</h4>
            <ul className="list-unstyled">
             
              <li><a href="#" className="footer-link">Coleção</a></li>
              <li><a href="#" className="footer-link">Sobre Nós</a></li>
       
            </ul>
          </div>
          {/* Seção Contato */}
          <div className="col-md-4 mb-4">
            <h4 className="footer-title">Contato</h4>
            <p className="footer-text">Email: poderaospez@gmail.com</p>
            <p className="footer-text">Telefone: (61) 1234-5678</p>
            
            <div className="footer-social">
              <a href="#" className="me-2"><i className="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/poder_aospes/" className="me-2"><i className="fab fa-instagram"></i></a>
              
              {/* Link para WhatsApp */}
              <a 
                href="https://wa.me/556112345678?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20seus%20produtos." 
                className="me-2" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <i className="fab fa-whatsapp"></i> {/* Ícone do WhatsApp */}
              </a>
            </div>
          </div>

        </div>
        <div className="row mt-3">
          <div className="col text-center">
            <p className="footer-bottom">&copy; 2024 Loja Feminina. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
