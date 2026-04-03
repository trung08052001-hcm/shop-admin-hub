import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Loader2 } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useApi';
import type { Product } from '@/types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const { data, isLoading, isError } = useProducts(page, 10, search || undefined);
  const deleteProduct = useDeleteProduct();

  const products: Product[] = data?.data ?? data?.products ?? (Array.isArray(data) ? data : []);
  const totalPages: number = data?.totalPages ?? 1;

  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setShowModal(true); };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sản phẩm</h1>
            <p className="text-sm text-muted-foreground">Quản lý danh sách sản phẩm</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-card hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải sản phẩm. Kiểm tra kết nối backend.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danh mục</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Giá</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kho</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đánh giá</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-foreground">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${product.stock < 10 ? 'text-destructive' : 'text-success'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">⭐ {product.rating} ({product.numReviews})</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(product)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteProduct.mutate(product._id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border px-3 py-1.5 text-sm text-foreground disabled:opacity-40">Trước</button>
                <span className="text-sm text-muted-foreground">Trang {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border px-3 py-1.5 text-sm text-foreground disabled:opacity-40">Sau</button>
              </div>
            )}
          </>
        )}

        {showModal && (
          <ProductModal product={editProduct} onClose={() => setShowModal(false)} />
        )}
      </div>
    </AdminLayout>
  );
};

const ProductModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
  const isEdit = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    image: product?.image || '',
    category: product?.category || '',
    stock: product?.stock?.toString() || '',
  });

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    if (isEdit) {
      updateProduct.mutate({ id: product._id, data: payload }, { onSuccess: () => onClose() });
    } else {
      createProduct.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-card-foreground">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Tên sản phẩm', key: 'name', type: 'text' },
            { label: 'Mô tả', key: 'description', type: 'text' },
            { label: 'Giá (VNĐ)', key: 'price', type: 'number' },
            { label: 'URL hình ảnh', key: 'image', type: 'text' },
            { label: 'Danh mục', key: 'category', type: 'text' },
            { label: 'Số lượng kho', key: 'stock', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium text-foreground">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-input bg-background py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">Hủy</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
              {isSubmitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductsPage;
