import AdminHeader from "./AdminHeader.tsx";
import AdminSidebar from "./AdminSidebar.tsx";
import { Outlet } from "react-router-dom";
import "./AdminLayout.css";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="main">
        <AdminHeader />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
