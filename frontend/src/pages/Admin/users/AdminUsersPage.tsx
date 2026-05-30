import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  FiSearch,
  FiX,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiSlash,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import "./AdminUsersPage.css";
import UserDetailModal from "./UserDetailModal.tsx";
import { User } from "../../../types/UserAdmin.ts";
import { getAllUsers, toggleUserActive } from "../../../api/adminApis.ts";

// debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debouncedValue;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Pagination: fixed 5 per page per your API example
  const [page, setPage] = useState<number>(1);
  const limit = 5;
  const [total, setTotal] = useState<number>(0);
  const [totalPagesApi, setTotalPagesApi] = useState<number>(1);

  const debouncedQuery = useDebounce(query, 500);

  const normalizeApiUser = (item: any): User => ({
    id: item._id,
    _id: item._id,
    fullName: item.fullName || "",
    username: item.username,
    email: item.email,
    phone: item.phone ?? item.phoneNumber,
    phoneNumber: item.phoneNumber,
    gender: item.gender,
    dateOfBirth: item.dateOfBirth,
    avt: item.avt,
    role: item.isAdmin ? "ADMIN" : item.role ?? "USER",
    isAdmin: item.isAdmin,
    isActive: item.isActive ?? true,
    xu: item.xu,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    address: item.address,
    note: item.note,
  } as User);

  // reset to first page when search changes
  useEffect(() => setPage(1), [debouncedQuery]);

  // fetch users using exact JSON shape from your API (resp.data + resp.pagination)
  useEffect(() => {
    const fetchUsers = async () => {
     setLoading(true);
      try {
        console.log("[AdminUsersPage] requesting users", { page, limit, query: debouncedQuery });
        const resp = await getAllUsers(page, limit, debouncedQuery);
        console.log("[AdminUsersPage] API raw response:", resp);

        // expected: { success:true, message, data: [...], pagination: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
        if (resp && resp.success && Array.isArray(resp.data)) {
          const list = resp.data;
          const p = resp.pagination ?? {};

          // use pagination values strictly when provided by API
          const apiTotal = typeof p.total === "number" ? p.total : list.length;
          const apiTotalPages = typeof p.totalPages === "number" ? p.totalPages : Math.max(1, Math.ceil(apiTotal / limit));

          setUsers(list.map(normalizeApiUser));
          setTotal(apiTotal);
          setTotalPagesApi(apiTotalPages);

          // if backend reports page different and valid, sync it (clamp)
          if (typeof p.page === "number" && p.page >= 1 && p.page <= apiTotalPages && p.page !== page) {
            setPage(p.page);
          }

          console.log("[AdminUsersPage] pagination from API:", { apiTotal, apiTotalPages, pageFromApi: p.page });
        } else if (Array.isArray(resp)) {
          // fallback: plain array -> client-side paging
          const list = resp.map(normalizeApiUser);
          const apiTotal = list.length;
          const apiTotalPages = Math.max(1, Math.ceil(apiTotal / limit));
          setTotal(apiTotal);
          setTotalPagesApi(apiTotalPages);
          const start = (page - 1) * limit;
          setUsers(list.slice(start, start + limit));
          console.log("[AdminUsersPage] fallback array response used for client paging", { apiTotal, apiTotalPages });
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err: any) {
        console.error("Fetch users error:", err);
        toast.error(err?.message || "Không thể tải danh sách người dùng");
        setUsers([]);
        setTotal(0);
        setTotalPagesApi(1);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, debouncedQuery]);

  const formatIdShort = (u: User) => {
    const raw = String(u.id ?? u._id ?? "");
    if (!raw) return "-";
    return raw.slice(-4).toUpperCase();
  };

  const formatDate = (v?: any) => {
    if (!v) return "-";
    try {
      return new Date(v).toLocaleDateString("vi-VN");
    } catch {
      return String(v);
    }
  };

  const totalPages = Math.max(1, totalPagesApi);

  const gotoPage = (p: number) => {
    const newPage = Math.max(1, Math.min(p, totalPages));
    console.log("[AdminUsersPage] gotoPage requested:", p, "-> using:", newPage, { page, totalPages, total });
    if (newPage !== page) setPage(newPage);
  };

  const handleSearchChange = (value: string) => setQuery(value);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: (number | string)[] = [];
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);

    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button key={idx} className={`btn tiny ${p === page ? "primary" : ""}`} onClick={() => gotoPage(p)} disabled={p === page}>
              {p}
            </button>
          ) : (
            <span key={idx} style={{ padding: "0 6px", color: "#999" }}>{p}</span>
          )
        )}
      </div>
    );
  };

  const toggleActive = async (user: User) => {
    const id = String(user.id ?? user._id ?? "");
    if (!id) {
      toast.error("ID người dùng không hợp lệ");
      return;
    }

    // optimistic update
    const nextState = !Boolean(user.isActive);
    setTogglingUserId(id);
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u)));

    try {
      const res = await toggleUserActive(id, nextState);
      toast.success(res?.message ?? (nextState ? "Mở khóa thành công" : "Khóa thành công"));
    } catch (err: any) {
      // revert on error
      console.error("[AdminUsersPage] toggleUserActive error:", err);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive: !!user.isActive } : u)));
      toast.error(err?.message || "Không thể cập nhật trạng thái người dùng");
    } finally {
      setTogglingUserId(null);
    }
  };
  
  return (
    <div className="admin-users page-container">
      <div className="page-head">
        <div>
          <h2>Quản lý người dùng</h2>
          <p className="muted">Xem, tìm kiếm và quản lý tài khoản người dùng</p>
        </div>

        <div className="controls">
          <div className="search">
            <FiSearch className="search-icon" />
            <input placeholder="Tìm theo tên, email..." value={query} onChange={(e) => handleSearchChange(e.target.value)} />
            {query && <button className="icon-clear" onClick={() => handleSearchChange("")}><FiX /></button>}
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
            <p style={{ color: "#666" }}>Đang tải người dùng...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 18, color: "#999", marginBottom: 8 }}>{debouncedQuery ? "Không tìm thấy người dùng nào" : "Chưa có người dùng"}</p>
            {debouncedQuery && <p style={{ color: "#666" }}>Thử tìm kiếm với từ khóa khác</p>}
          </div>
        ) : (
          <>
            <table className="users-table modern">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Ngày tạo</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th style={{ width: 150 }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id ?? u.email} onClick={() => setSelectedUser(u)} className="row-clickable">
                    <td className="mono">{formatIdShort(u)}</td>
                    <td>
                      <div className="cell-with-avatar">
                        <div className="avatar small">{(u.fullName ?? "?").charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="strong">{u.fullName}</div>
                          {u.address && <div className="muted tiny">{u.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "-"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td><span className={`role-badge ${u.role === "ADMIN" ? "admin" : "user"}`}>{u.role}</span></td>
                    <td><span className={`status-badge ${u.isActive ? "active" : "inactive"}`}>{u.isActive ? "Hoạt động" : "Đã khóa"}</span></td>
                    <td className="actions">
                      <button
                        className="btn tiny"
                        onClick={(e) => { e.stopPropagation(); toggleActive(u); }}
                        title={u.isActive ? "Khóa tài khoản" : "Mở khóa"}
                        disabled={togglingUserId === String(u.id ?? u._id ?? "")}
                        aria-busy={togglingUserId === String(u.id ?? u._id ?? "")}
                      >
                        {togglingUserId === String(u.id ?? u._id ?? "") ? "..." : (u.isActive ? <FiSlash /> : <FiCheck />)}
                      </button>
                      <button className="btn tiny" onClick={(e) => { e.stopPropagation(); setSelectedUser(u); }} title="Xem chi tiết"><FiEdit /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div
              className="pagination-bar"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "12px 16px",
                borderTop: "1px solid #eee",
              }}
            >

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn tiny" onClick={() => gotoPage(page - 1)} disabled={page <= 1} title="Trang trước"><FiChevronLeft /></button>

                {renderPagination()}

                <button className="btn tiny" onClick={() => gotoPage(page + 1)} disabled={page >= totalPages} title="Trang sau"><FiChevronRight /></button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(updatedUser: User) => {
            // update local list and close modal
            setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            setSelectedUser(null);
            toast.success("Cập nhật người dùng thành công");
          }}
        />
      )}

       {/* <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable theme="colored" /> */}
     </div>
   );
 };
 
 export default AdminUsersPage;