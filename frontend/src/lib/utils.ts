import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = 'inr'): string {
    const symbols: Record<string, string> = { inr: '₹', usd: '$' };
    return `${symbols[currency] || '₹'}${amount.toLocaleString()}`;
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function calculateDiscount(price: number, discountPrice: number): number {
    if (price === 0) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

export function getLevelColor(level: string): string {
    switch (level) {
        case 'beginner': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
        case 'intermediate': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
        case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default: return 'bg-gray-100 text-gray-800';
    }
}