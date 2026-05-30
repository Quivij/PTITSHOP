import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // lấy slug từ URL
import ProductsSection from "../../components/products/ProductsSection.tsx";
import { Product } from "../../types/Product.ts";
import { formatPrice } from "../../utils/format.ts";
import { CategoryApi } from "../../api/categoryApi.ts";
import { get } from "http";
import { getCategoryNameFromSlug } from "../../utils/categoryUtils.ts";


const CategoryPage = () => {
  const { slug } = useParams(); // ví dụ: /category/ao
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (pageNum: number) => {
  if (!slug) return;
  try {
    console.log('>>> Fetching products for category:', slug ,' page:', pageNum);
    setLoading(true);
    const res = await CategoryApi.getProductsByCategoryPagination(slug, pageNum, 6);
    setProducts(res.data || []);
    setTotalPages(res.pagination.totalPages || 1);
  } catch (err: any) {
    console.error("Error fetching products by category:", err);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    console.log("CategoryPage mounted, slug =", slug, "page =", page);
    fetchProducts(page);
  }, [slug, page]);

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Danh mục: {getCategoryNameFromSlug(slug || "")}
      </h1>

      <ProductsSection
        title={`Sản phẩm trong ${getCategoryNameFromSlug(slug || "")}`}
        subtitle={`Trang ${page}/${totalPages}`}
        products={products}
        formatPrice={formatPrice}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang trước
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
