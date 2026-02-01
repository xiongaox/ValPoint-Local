import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - Tailwind CSS 类名合并工具
 * 结合 clsx 处理条件逻辑，并使用 tailwind-merge 解决类名冲突。
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
