import { useState, useEffect } from "react";
import axios from "axios";
import { FiBox } from "react-icons/fi";
import { Category } from "../../../types/Category";
import { ApiAddProductResponse, Product } from "../../../types/Product";
import AddProductDialog from "./AddProductDialog.tsx";
import EditProductDialog from "./EditProductDialog.tsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminProductsPage.css";
import { adminProductApi } from "../../../api/adminProductApi.ts";
import { CategoryApi } from "../../../api/categoryApi.ts";
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // 👈 danh mục fetch từ BE

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, filterCategory]);

  const fetchProducts = async () => {
    try {
      const res = await adminProductApi.getProducts(page, 10, filterCategory);
      console.log(res);
      if(res.success){
        setProducts(res.data || []);
        setTotalPages(res.pagination.totalPages);
      }
      
      // if (res.success) {
      //   setProducts(res.data);
      //   setTotalPages(res.pagination.totalPages);
      // }
    } catch (err) {
      toast.error("Không thể tải danh sách sản phẩm!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      const res = await adminProductApi.deleteProduct(id);
      if (res.success) {
        toast.success("Đã xóa sản phẩm!");
        fetchProducts();
      } else {
        toast.error("Xóa sản phẩm thất bại!");
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  const handleAdd = (res: ApiAddProductResponse<Product>) => {
    if(res.success){
      console.log("Added product:", res);
      setIsAddOpen(false);
      console.log("Added product:", res);
      toast.success("Thêm sản phẩm thành công!");
      fetchProducts();
      fetchCategories();
    }
    else{
      toast.error("Thêm sản phẩm thất bại!");
    }

  };

  const handleEdit = (data: ApiAddProductResponse<Product>) => {
    if(data.success){
      console.log("Edited product:", data);
      setIsEditOpen(false);
      toast.success("Cập nhật sản phẩm thành công!");
    }
    else{
      toast.error("Cập nhật sản phẩm thất bại!");
    }
    fetchProducts();
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const data = await CategoryApi.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2><FiBox /> Quản lý sản phẩm</h2>
        <div className="actions">
          <select
            value={filterCategory}
            onChange={(e) => {
              setPage(1);
              setFilterCategory(e.target.value);
            }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cate) => (
              <option key={cate._id} value={`${cate._id}`}>
                {cate.name}
              </option>
            ))}
          </select>
          <button className="btn1 btn-primary1" onClick={() => setIsAddOpen(true)}>
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Giảm</th>
            <th>Số lượng</th>
            <th>Đã bán</th>
            <th>Lượt xem</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name} className="product-img" />
                ) : (
                  <span className="no-img">No Image</span>
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.category?.name}</td>
              <td>{p.price.toLocaleString()} đ</td>
              <td>{p.discount ?? 0}%</td>
              <td>{p.quantity}</td>
              <td>{p.sold}</td>
              <td>{p.views}</td>
              <td
                className={
                  p.status === "available" ? "status-available" : "status-out"
                }
              >
                {p.status === "available" ? "Còn hàng" : p.status === "out_of_stock" ? "Hết hàng" : "Đã xóa"}
              </td>
              <td>
                {p.status !== "deleted" && (
                  <>
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        setEditingProduct(p);
                        setIsEditOpen(true);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(p._id)}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Trước
        </button>
        <span>{page}/{totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
      {/* Dialogs */}
      <AddProductDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      {editingProduct && (
        <EditProductDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSave={handleEdit}
          product={editingProduct}
        />
      )}

    </div>
  );
}
