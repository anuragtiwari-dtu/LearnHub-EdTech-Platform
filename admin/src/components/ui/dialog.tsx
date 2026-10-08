import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            <div className={cn(
                'bg-card border rounded-xl shadow-xl w-full max-w-2xl mx-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-200',
                className
            )}>
                {children}
            </div>
        </div>
    );
}

export function DialogHeader({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
    return (
        <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">{children}</h2>
            {onClose && (
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('p-6', className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('flex items-center justify-end gap-3 p-6 border-t', className)}>{children}</div>;
}
