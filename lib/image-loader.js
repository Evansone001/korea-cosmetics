export default function imageLoader({ src }) {
  // If src is already a full URL, return it as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  // If src is a relative path starting with /uploads/, prepend backend URL
  if (src.startsWith('/uploads/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
    return `${backendUrl}${src}`;
  }
  // Otherwise, treat it as a relative path
  return src;
}
