import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion } from 'framer-motion';
import { FileText, Trash2, Loader2, Download, ExternalLink } from 'lucide-react';
import { useRecruitments, useDeleteRecruitment } from '@/hooks/useApi';
import type { Recruitment } from '@/types';
import RecruitmentStatusSelect from '@/components/RecruitmentStatusSelect';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const RecruitmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: recruitments, isLoading, isError } = useRecruitments();
  const deleteRecruitment = useDeleteRecruitment();

  const filteredRecruitments = recruitments?.filter(r => 
    r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      deleteRecruitment.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Tuyển dụng</h1>
            <p className="text-sm text-muted-foreground">Quản lý hồ sơ ứng viên và tuyển dụng</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm ứng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">Không thể tải dữ liệu ứng viên. Hãy kiểm tra kết nối backend.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="rounded-xl border bg-card shadow-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Ứng viên / Email</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Vị trí</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Ngày nộp</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">CV (PDF)</th>
                    <th className="px-6 py-4 font-semibold text-right text-muted-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRecruitments && filteredRecruitments.length > 0 ? (
                    filteredRecruitments.map((app: Recruitment) => (
                      <tr key={app._id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{app.userEmail.split('@')[0]}</div>
                          <div className="text-xs text-muted-foreground">{app.userEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 text-secondary-foreground font-medium text-xs">
                            {app.jobTitle}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <RecruitmentStatusSelect recruitment={app} />
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <a 
                              href={`${BACKEND_URL}${app.cvPath}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                              title="Mở PDF trong tab mới"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="underline underline-offset-4">Xem CV</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(app._id)}
                            disabled={deleteRecruitment.isPending}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        Không tìm thấy hồ sơ nào.
                      </td>
                    </tr>
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

export default RecruitmentsPage;
