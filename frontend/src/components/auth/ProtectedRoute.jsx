export default function ProtectedRoute({ isAllowed, fallback = null, children }) {
  if (!isAllowed) return fallback;
  return children;
}

