import type { Recruitment, RecruitmentStatus } from '@/types';
import { useUpdateRecruitmentStatus } from '@/hooks/useApi';

const statusLabels: Record<RecruitmentStatus, string> = {
  pending: 'Chờ xử lý',
  reviewed: 'Đã duyệt',
  interviewing: 'Phỏng vấn',
  accepted: 'Chấp nhận',
  rejected: 'Từ chối',
};

const RecruitmentStatusSelect = ({ recruitment }: { recruitment: Recruitment }) => {
  const updateStatus = useUpdateRecruitmentStatus();
  
  return (
    <select
      value={recruitment.status}
      onChange={(e) => updateStatus.mutate({ id: recruitment._id, status: e.target.value as RecruitmentStatus })}
      disabled={updateStatus.isPending}
      className={`appearance-none cursor-pointer inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-colors ${
        recruitment.status === 'pending' ? 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20' :
        recruitment.status === 'reviewed' ? 'bg-info/10 text-info border-info/30 hover:bg-info/20' :
        recruitment.status === 'interviewing' ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' :
        recruitment.status === 'accepted' ? 'bg-success/10 text-success border-success/30 hover:bg-success/20' :
        'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
      } ${updateStatus.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {(['pending', 'reviewed', 'interviewing', 'accepted', 'rejected'] as RecruitmentStatus[]).map((s) => (
        <option key={s} value={s} className="text-foreground bg-background">{statusLabels[s]}</option>
      ))}
    </select>
  );
};

export default RecruitmentStatusSelect;
