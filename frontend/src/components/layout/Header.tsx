import React from "react";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Chào mừng đến với PTITShop</h1>
        <p>Nơi mua bán an toàn, nhanh chóng và tiện lợi.</p>
        <button className="btn-header" onClick={() => window.location.href = "/products"}>Khám phá ngay</button>
      </div>
    </header>
  );
};

export default Header;
