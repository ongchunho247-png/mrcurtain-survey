/**
 * helpers.js
 * Các hàm tiện ích dùng chung
 */

/**
 * Format ngày theo dạng DD/MM/YYYY
 * @param {string} dateStr - ISO date string hoặc YYYY-MM-DD
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    // Nếu là YYYY-MM-DD (từ input date), tạo ngày không bị lệch timezone
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-')
      return `${day}/${month}/${year}`
    }
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Lấy ngày hôm nay theo format YYYY-MM-DD (dùng cho input[type=date])
 */
export function getTodayString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Label bộ phận
 */
export function getDeptLabel(dept) {
  const map = { sale: 'Sale', technical: 'Kỹ thuật' }
  return map[dept] || dept
}
