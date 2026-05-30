import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">PTITShop</div>
        <ul className="footer-links">
          <li><a href="/">Trang chủ</a></li>
          <li><a href="/policy">Chính sách</a></li>
          <li><a href="/faq">Hỏi đáp</a></li>
        </ul>
      </div>
      <div className="footer-bottom">
        <p>© 2025 PTITShop. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
