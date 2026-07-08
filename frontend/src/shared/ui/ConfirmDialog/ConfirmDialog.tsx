import { Modal } from '@/shared/ui/Modal/Modal';
import { Button } from '@/shared/ui/Button/Button';
import { cn } from '@/shared/lib/cn';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="text-center">
        {variant === 'danger' && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-market-red/15">
            <span className="text-2xl text-market-red">!</span>
          </div>
        )}
        <h3 className={cn('text-lg font-semibold', variant === 'danger' ? 'text-market-red' : 'text-white')}>
          {title}
        </h3>
        <p className="mt-2 text-sm text-white-70">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
