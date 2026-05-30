import { LayoutDashboard, Users, Package, ShoppingCart, BarChart3 } from "lucide-react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="logo">
        {/* <img src="https://portal.ptit.edu.vn/wp-content/uploads/2016/04/ptit-logo.png" alt="Logo" /> */}
        <span>PTITShop</span>
      </div>

      <nav className="menu">
        <NavLink to="/admin/dashboard">
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users">
          <Users size={18} />
          <span>Users</span>
        </NavLink>
        <NavLink to="/admin/products">
          <Package size={18} />
          <span>Products</span>
        </NavLink>
        <NavLink to="/admin/orders">
          <ShoppingCart size={18} />
          <span>Orders</span>
        </NavLink>
        <NavLink to="/admin/reports">
          <BarChart3 size={18} />
          <span>Reports</span>
        </NavLink>
      </nav>
    </aside>
  );
}
