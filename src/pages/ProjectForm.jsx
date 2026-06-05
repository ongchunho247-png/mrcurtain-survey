import { useState } from 'react'
import { saveProject } from '../utils/storage'
import { getTodayString } from '../utils/helpers'

// Giá trị mặc định của form
const INITIAL_FORM = {
  projectName: '',
  customerName: '',
  address: '',
  surveyPerson: '',
  department: 'sale',
  surveyDate: getTodayString(),
  generalNote: '',
}

// Các trường bắt buộc
const REQUIRED_FIELDS = {
  projectName: 'Tên công trình',
  customerName: 'Tên khách hàng',
  surveyPerson: 'Người khảo sát',
  surveyDate: 'Ngày khảo sát',
}

export default function ProjectForm({ onBack, onSaved }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)

  // Kiểm tra form có bị thay đổi không (để hỏi xác nhận hủy)
  const isDirty = Object.keys(INITIAL_FORM).some(
    key => key !== 'surveyDate' && key !== 'department' && form[key] !== INITIAL_FORM[key]
  )

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  function validate() {
    const newErrors = {}
    Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
      if (!form[field] || !form[field].toString().trim()) {
        newErrors[field] = `${label} không được để trống`
      }
    })
    return newErrors
  }

  function handleSave() {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll lên trên để thấy lỗi
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSaving(true)
    try {
      const saved = saveProject({
        projectName: form.projectName.trim(),
        customerName: form.customerName.trim(),
        address: form.address.trim(),
        surveyPerson: form.surveyPerson.trim(),
        department: form.department,
        surveyDate: form.surveyDate,
        generalNote: form.generalNote.trim(),
      })
      // Báo cho danh sách refresh
      window.dispatchEvent(new Event('projectsUpdated'))
      onSaved(saved)
    } catch (err) {
      console.error('[ProjectForm] Lỗi lưu công trình:', err)
      alert('Có lỗi xảy ra khi lưu. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (isDirty) {
      setShowConfirmCancel(true)
    } else {
      onBack()
    }
  }

  const hasErrors = Object.values(errors).some(Boolean)

  return (
    <div className="app-container">
      {/* Header */}
      <header className="page-header">
        <button className="btn-back" onClick={handleCancel} aria-label="Quay lại">
          ‹
        </button>
        <h1>Tạo công trình mới</h1>
      </header>

      {/* Form */}
      <div className="page-content">
        {/* Alert tổng hợp lỗi */}
        {hasErrors && (
          <div className="alert alert-danger">
            <span className="alert-icon">⚠️</span>
            <span>Vui lòng điền đầy đủ các trường bắt buộc được đánh dấu <strong>*</strong></span>
          </div>
        )}

        <div className="form-container">
          {/* Section 1: Thông tin công trình */}
          <div className="form-section">
            <div className="form-section-title">Thông tin công trình</div>

            <div className="form-group">
              <label className="form-label" htmlFor="projectName">
                Tên công trình <span className="required">*</span>
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                className={`form-input ${errors.projectName ? 'error' : ''}`}
                placeholder="Ví dụ: Căn hộ Vinhomes Q9 - P1201"
                value={form.projectName}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.projectName && (
                <div className="form-error">
                  <span>⚠</span> {errors.projectName}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerName">
                Tên khách hàng <span className="required">*</span>
              </label>
              <input
                id="customerName"
                name="customerName"
                type="text"
                className={`form-input ${errors.customerName ? 'error' : ''}`}
                placeholder="Họ tên khách hàng"
                value={form.customerName}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.customerName && (
                <div className="form-error">
                  <span>⚠</span> {errors.customerName}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">
                Địa chỉ công trình
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="form-input"
                placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                value={form.address}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Section 2: Thông tin khảo sát */}
          <div className="form-section">
            <div className="form-section-title">Thông tin khảo sát</div>

            <div className="form-group">
              <label className="form-label" htmlFor="surveyPerson">
                Người khảo sát <span className="required">*</span>
              </label>
              <input
                id="surveyPerson"
                name="surveyPerson"
                type="text"
                className={`form-input ${errors.surveyPerson ? 'error' : ''}`}
                placeholder="Tên nhân viên khảo sát"
                value={form.surveyPerson}
                onChange={handleChange}
                autoComplete="off"
              />
              {errors.surveyPerson && (
                <div className="form-error">
                  <span>⚠</span> {errors.surveyPerson}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Bộ phận</label>
              <div className="dept-toggle">
                <div className="dept-option">
                  <input
                    type="radio"
                    id="dept-sale"
                    name="department"
                    value="sale"
                    checked={form.department === 'sale'}
                    onChange={handleChange}
                  />
                  <label htmlFor="dept-sale">
                    <span>💼</span> Sale
                  </label>
                </div>
                <div className="dept-option">
                  <input
                    type="radio"
                    id="dept-technical"
                    name="department"
                    value="technical"
                    checked={form.department === 'technical'}
                    onChange={handleChange}
                  />
                  <label htmlFor="dept-technical">
                    <span>🔧</span> Kỹ thuật
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="surveyDate">
                Ngày khảo sát <span className="required">*</span>
              </label>
              <input
                id="surveyDate"
                name="surveyDate"
                type="date"
                className={`form-input ${errors.surveyDate ? 'error' : ''}`}
                value={form.surveyDate}
                onChange={handleChange}
              />
              {errors.surveyDate && (
                <div className="form-error">
                  <span>⚠</span> {errors.surveyDate}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Ghi chú */}
          <div className="form-section">
            <div className="form-section-title">Ghi chú chung</div>

            <div className="form-group">
              <label className="form-label" htmlFor="generalNote">
                Ghi chú
              </label>
              <textarea
                id="generalNote"
                name="generalNote"
                className="form-textarea"
                placeholder="Ghi chú về công trình, yêu cầu đặc biệt, lưu ý khi khảo sát..."
                value={form.generalNote}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="form-actions">
            <button
              className="btn btn-primary btn-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Đang lưu...' : '✓ Lưu công trình'}
            </button>
            <button
              className="btn btn-secondary btn-full"
              onClick={handleCancel}
              disabled={saving}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>

      {/* Modal xác nhận hủy */}
      {showConfirmCancel && (
        <ConfirmCancelModal
          onConfirm={onBack}
          onDismiss={() => setShowConfirmCancel(false)}
        />
      )}
    </div>
  )
}

function ConfirmCancelModal({ onConfirm, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', zIndex: 300,
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: 'white', borderRadius: '16px', padding: '24px',
          width: '100%', maxWidth: '320px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>⚠️</div>
        <h3 style={{ fontSize: '17px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
          Hủy tạo công trình?
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
          Dữ liệu bạn đã nhập sẽ không được lưu.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-full"
            style={{ flex: 1 }}
            onClick={onDismiss}
          >
            Tiếp tục nhập
          </button>
          <button
            className="btn btn-danger btn-full"
            style={{ flex: 1 }}
            onClick={onConfirm}
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  )
}
