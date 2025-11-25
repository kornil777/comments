export function escapeHtml(unsafe) {
  return unsafe
  .replace("<", "&lt;")
  .replace(">", "&gt;");
}
