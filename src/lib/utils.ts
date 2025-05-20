import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const cn = (...classes: ClassValue[]) => {
    return twMerge(clsx(classes))
}

const toHex = (buffer: Uint8Array): string => {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export { cn, toHex }
