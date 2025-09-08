import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const graduationYears = Array.from({ length: new Date().getFullYear() - 1959 }, (_, i) => String(new Date().getFullYear() - i));
