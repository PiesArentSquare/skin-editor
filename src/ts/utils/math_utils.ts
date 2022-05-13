export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max)
}

export function map(v: number, min_in: number, max_in: number, min_out: number, max_out: number) {
    return (v - min_in) / (max_in - min_in) * (max_out - min_out) + min_out
}
