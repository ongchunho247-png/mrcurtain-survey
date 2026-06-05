import { useState, useEffect } from 'react'
import { getProjects } from '../utils/storage'
import { formatDate, getDeptLabel } from '../utils/helpers'

export default function ProjectList({ onCreateNew }) {
  const [projects, setProjects] = useState([])

  // Load từ localStorage khi mount
  useEffect(() => {
    setProjects(getProjects())
  }, [])

  // Refresh khi component được focus lại (sau khi tạo mới)
  useEffect(() => {
    const handleFocus = () => setProjects(getProjects())
    window.addEventListener('projectsUpdated', handleFocus)
    return () => window.removeEventListener('projectsUpdated', handleFocus)
  }, [])

  return (
    <div className="app-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1>MrCurtain Survey</h1>
          <div className="header-subtitle">Hệ thống khảo sát công trình</div>
        </div>
      </header>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stats-count">
          <strong>{projects.length}</strong>
          {projects.length === 1 ? 'công trình' : 'công trình'}
        </div>
      </div>

      {/* Page content */}
      <div className="page-content">
        {/* Nút tạo mới */}
        <button className="btn-create-bar" onClick={onCreateNew}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span>
          Tạo công trình mới
        </button>

        {/* Danh sách */}
        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Chưa có công trình nào</div>
            <div className="empty-desc">
              Bấm <strong>"Tạo công trình mới"</strong> phía trên để bắt đầu tạo hồ sơ khảo sát đầu tiên.
            </div>
          </div>
        ) : (
          <div>
            {projects.map(project => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  const deptClass = project.department === 'sale' ? 'badge-sale' : 'badge-technical'

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">{project.projectName}</div>
        <span className={`card-badge ${deptClass}`}>
          {getDeptLabel(project.department)}
        </span>
      </div>

      <div className="card-meta">
        <div className="meta-item">
          <span className="meta-label">Khách hàng</span>
          <span className="meta-value">{project.customerName}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Người khảo sát</span>
          <span className="meta-value">{project.surveyPerson}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Ngày khảo sát</span>
          <span className="meta-value">{formatDate(project.surveyDate)}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Địa chỉ</span>
          <span className="meta-value" style={{ fontSize: '12px' }}>
            {project.address || '—'}
          </span>
        </div>
      </div>

      <div className="card-divider" />

      <div className="card-footer">
        <div className="img-count-pill">
          <span>📷</span>
          <span>{project.imageCount ?? 0} ảnh</span>
        </div>
        <span className="card-arrow">›</span>
      </div>
    </div>
  )
}
