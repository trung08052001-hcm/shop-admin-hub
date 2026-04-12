import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { Trash2, Loader2, Star } from 'lucide-react';
import { useReviews, useDeleteReview } from '@/hooks/useApi';
import type { Review } from '@/types';

const ReviewsPage = () => {
  const { data, isLoading, isError } = useReviews();
  const deleteReview = useDeleteReview();

  // Fallback to empty array if data isn't available
  const reviews: Review[] = data ?? [];

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xoá bình luận này không?')) {
      deleteReview.mutate(id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <Star 
        key={idx} 
        className={`h-4 w-4 ${idx < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý Bình luận</h1>
          <p className="text-sm text-muted-foreground">Theo dõi và kiểm duyệt các đánh giá từ khách hàng</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải bình luận. Kiểm tra kết nối backend.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[150px]">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[200px]">Sản phẩm đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">Số sao</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[250px]">Nội dung</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">Ngày viết</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        Chưa có bình luận nào.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground">
                            {review.user?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-foreground line-clamp-2">
                            {review.product?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]" title={review.comment}>
                            {review.comment}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleDelete(review._id)} 
                              className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Xoá bình luận"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsPage;
