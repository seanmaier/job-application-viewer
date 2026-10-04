// Returns a copy of arr with the item at `from` moved to index `to`. Out-of-range
// targets return the array unchanged, so callers can wire ↑/↓ buttons without
// bounds-checking the first and last item themselves.
export function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
