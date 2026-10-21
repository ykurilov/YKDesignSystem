/** surface2 → surface-2, borderStrong → border-strong. */
export function kebabCase(name: string): string {
  return name.replace(/([A-Z]|\d+)/g, "-$1").toLowerCase();
}
