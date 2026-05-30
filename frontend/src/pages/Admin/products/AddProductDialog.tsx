import { useState, useEffect } from "react";
import { Category } from "../../../types/Category";
import { Product, CreateProductPayload, ApiAddProductResponse} from "../../../types/Product";
import { CategoryApi } from "../../../api/categoryApi.ts";
import { toast, ToastContainer } from "react-toastify";
import { adminProductApi } from "../../../api/adminProductApi.ts";

import "./ProductDialog.css";
import { setMaxIdleHTTPParsers } from "http";
import { on } from "events";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ApiAddProductResponse<Product>) => void;
};

export default function AddProductDialog({ isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Product>({
    _id: "",
    name: "",
    price: 0,
    discount: 0,
    quantity: 0,
    sold: 0,
    description: "",
    category: { _id: "", name: "", slug: "" } as Category,
    views: 0,
    images: [],
    status: "available",
    slug: "",
    createdAt: Date.now(),
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageLink, setImageLink] = useState("");
  const [images, setImages] = useState<{ url: string; alt: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
          const data = await CategoryApi.getCategories();
          setCategories(data || []);
        } catch (err) {
          console.error("Error fetching categories:", err);
        }
  };

  // thêm ảnh từ link
  const handleAddImage = () => {
    if (!imageLink.trim()) return;
    setImages((prev) => [...prev, { url: imageLink, alt: formData.name }]);
    setImageLink("");
  };

  // xóa ảnh
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // thêm danh mục mới
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    try {
      const res = await CategoryApi.addCategory({
        name: newCategory,
      });
      if (res.success) {
        toast.success(res.message || "Thêm danh mục thành công!");
        fetchCategories();
        // chọn luôn danh mục mới thêm
        setFormData({ ...formData, category: res.data });
        //select mới thêm
        setShowAddCategory(false)
      } else {
        toast.error(res.message || "Thêm thất bại!");
      }
    } catch (error) {
      toast.error("Lỗi máy chủ hoặc kết nối!");
    }
    
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim() || !formData.price || !formData.category?._id || images.length === 0) {
        toast.error("Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      const payload: CreateProductPayload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        discount: formData.discount,
        quantity: formData.quantity,
        category: formData.category._id,
        images: images.map((img) => ({ url: img.url, alt: img.alt })),
      };

      const res = await adminProductApi.addProduct(payload);

      if (res.success) {
        onSave(res); // gửi lại data cho component cha nếu cần
        onClose();
      } else {
        toast.error(res.message || "Thêm sản phẩm thất bại!");
      }
    } catch (error) { 
      console.error("Error add product:", error);
      toast.error("Lỗi khi thêm sản phẩm!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Thêm sản phẩm</h2>

        <div className="modal-grid">
          {/* LEFT */}
          <div className="form-left">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input
                  type="number"
                  value={formData.price === 0 ? "" : formData.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      price: val === "" ? 0 : Number(val),
                    });
                  }}
                />

              </div>

              <div className="form-group">
                <label>Giảm giá (%)</label>
                <input
                  type="number"
                  value={formData.discount === 0 ? "" : formData.discount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      discount: val === "" ? 0 : Number(val),
                    });
                  }}
                />

              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tồn kho</label>
                <input
                  type="number"
                  value={formData.quantity === 0 ? "" : formData.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      quantity: val === "" ? 0 : Number(val),
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                {!showAddCategory ? (
                  <>
                    <select
                      value={formData.category?._id || ""}
                      onChange={(e) => {
                        const cat = categories.find(
                          (c) => c._id === e.target.value
                        );
                        if (cat) setFormData({ ...formData, category: cat });
                      }}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cate) => (
                        <option key={cate._id} value={`${cate._id}`}>
                          {cate.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn1 btn-addcat1"
                      onClick={() => setShowAddCategory(true)}
                    >
                      + Thêm mới
                    </button>
                  </>
                ) : (
                  <div className="add-cat-inline">
                    <input
                      type="text"
                      placeholder="Tên danh mục..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                    <button
                      className="btn1 btn-primary1"
                      onClick={handleAddCategory}
                    >
                      Lưu
                    </button>
                    <button
                      className="btn1 btn-cancel1"
                      onClick={() => setShowAddCategory(false)}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="form-right">
            <label>Ảnh sản phẩm</label>
            <div className="image-link-input">
              <input
                type="text"
                placeholder="Nhập link ảnh..."
                value={imageLink}
                onChange={(e) => setImageLink(e.target.value)}
              />
              <button className="btn1 btn-add1" onClick={handleAddImage}>
                Thêm
              </button>
            </div>

            <div className="image-grid">
              {images.map((img, index) => (
                <div key={index} className="image-item">
                  <img src={img.url} alt={img.alt} />
                  <div className="image-actions">
                    <button
                      className="btn1 btn-danger"
                      onClick={() => handleRemoveImage(index)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn1" onClick={onClose}>
            Hủy
          </button>
          <button className="btn1 btn-primary1" onClick={handleSave}>
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
