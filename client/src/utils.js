export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  return `${baseUrl}${path}`;
}
