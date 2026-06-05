/**
 * Shared utility functions
 */

/**
 * Clamps a number between 0 and 100, rounding to nearest integer
 */
export const clamp = (value: number): number => Math.max(0, Math.min(100, Math.round(value)))

/**
 * Returns unique items from an array
 */
export const unique = <T>(items: T[]): T[] => Array.from(new Set(items))
