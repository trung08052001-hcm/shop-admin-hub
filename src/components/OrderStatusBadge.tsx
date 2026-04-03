import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-warning/10 text-warning border-warning/30' },
  processing: { label: 'Đang xử lý', className: 'bg-info/10 text-info border-info/30' },
  shipped: { label: 'Đang giao', className: 'bg-primary/10 text-primary border-primary/30' },
  delivered: { label: 'Đã giao', className: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Đã hủy', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', config.className)}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
