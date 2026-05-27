import { useState } from 'react'
import ProjectList from './pages/ProjectList'
import ProjectForm from './pages/ProjectForm'

/**
 * App.jsx — Router đơn giản dùng state thay vì thư viện
 *
 * Các màn hình:
 *  - 'list'   : Danh sách công trình
 *  - 'create' : Tạo công trình mới
 */
export default function App() {
  const [screen, setScreen] = useState('list')
  const [toast, setToast] = useState(null)

  function showToast(msg, duration = 2500) {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  function handleCreateNew() {
    setScreen('create')
  }

  function handleBack() {
    setScreen('list')
  }

  function handleSaved(project) {
    setScreen('list')
    showToast(`✓ Đã lưu "${project.projectName}"`)
  }

  return (
    <>
      {screen === 'list' && (
        <ProjectList onCreateNew={handleCreateNew} />
      )}

      {screen === 'create' && (
        <ProjectForm onBack={handleBack} onSaved={handleSaved} />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="toast">{toast}</div>
      )}
    </>
  )
}
