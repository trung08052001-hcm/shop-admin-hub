import { cn } from '@/lib/utils';
import type { RecruitmentStatus } from '@/types';

const statusConfig: Record<RecruitmentStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-warning/10 text-warning border-warning/30' },
  reviewed: { label: 'Đã duyệt', className: 'bg-info/10 text-info border-info/30' },
  interviewing: { label: 'Phỏng vấn', className: 'bg-primary/10 text-primary border-primary/30' },
  accepted: { label: 'Chấp nhận', className: 'bg-success/10 text-success border-success/30' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const RecruitmentStatusBadge = ({ status }: { status: RecruitmentStatus }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
};

export default RecruitmentStatusBadge;
