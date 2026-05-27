/**
 * storage.js  —  MrCurtain Survey · Prompt 3
 * Quản lý dữ liệu công trình khảo sát bằng localStorage.
 *
 * API công khai:
 *   getProjects()          → Array<Project>
 *   saveProjects(projects) → void
 *   addProject(data)       → Project
 *   updateProject(id, upd) → Project | null
 *   deleteProject(id)      → void
 */

export const STORAGE_KEY        = 'mrcurtain_survey_projects';
export const STORAGE_KEY_LEGACY = 'mrcurtain_projects'; // key cũ từ Prompt 2

// ---------------------------------------------------------------------------
// Logger có cấu trúc (console, để dễ copy sang logs/diagnose-log.txt)
// ---------------------------------------------------------------------------
function storageLog(level, screen, action, description, detail = null) {
  const ts = new Date().toLocaleString('vi-VN');
  const lines = [
    `[${level}] ${ts}`,
    `  Màn hình       : ${screen}`,
    `  Lệnh đã chạy   : ${action}`,
    `  Mô tả          : ${description}`,
    detail ? `  Chi tiết        : ${detail}` : null,
    `  Key localStorage: ${STORAGE_KEY}`,
  ].filter(Boolean).join('\n');

  if (level === 'ERROR') console.error(lines);
  else console.info(lines);
}

// ---------------------------------------------------------------------------
// Migration: chuyển dữ liệu từ key cũ sang key mới (chạy 1 lần khi import)
// ---------------------------------------------------------------------------
function migrateFromLegacyKey() {
  try {
    const legacy  = localStorage.getItem(STORAGE_KEY_LEGACY);
    const current = localStorage.getItem(STORAGE_KEY);
    if (legacy && !current) {
      const data = JSON.parse(legacy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.removeItem(STORAGE_KEY_LEGACY);
      storageLog('INFO', 'khởi động', 'migrateFromLegacyKey()',
        `Đã migrate ${data.length} công trình từ key cũ → key mới`);
    }
  } catch (err) {
    storageLog('ERROR', 'khởi động', 'migrateFromLegacyKey()',
      'Lỗi migrate key cũ', String(err));
  }
}

migrateFromLegacyKey();

// ---------------------------------------------------------------------------
// generateId  —  sinh ID duy nhất cho công trình
// ---------------------------------------------------------------------------
function generateId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------------------------------------------------------------------------
// getProjects  —  đọc danh sách từ localStorage
// Trả về [] nếu chưa có dữ liệu hoặc dữ liệu bị lỗi (app không crash).
// ---------------------------------------------------------------------------
export function getProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw); // throw nếu JSON bị hỏng

    if (!Array.isArray(parsed)) {
      storageLog('ERROR', 'danh-sách', 'getProjects()',
        'Dữ liệu localStorage không phải Array — reset về []',
        `typeof: ${typeof parsed}`);
      return [];
    }

    return parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    storageLog('ERROR', 'danh-sách', 'getProjects()',
      'JSON.parse thất bại — dữ liệu localStorage bị hỏng, trả về []',
      String(err));
    return []; // app không crash
  }
}

// ---------------------------------------------------------------------------
// saveProjects  —  ghi toàn bộ mảng vào localStorage
// ---------------------------------------------------------------------------
export function saveProjects(projects) {
  try {
    if (!Array.isArray(projects)) {
      throw new TypeError('saveProjects: tham số phải là Array');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    storageLog('ERROR', 'lưu-dữ-liệu', 'saveProjects()',
      'Lỗi ghi localStorage', String(err));
    throw err; // ném lên để component xử lý
  }
}

// ---------------------------------------------------------------------------
// addProject  —  thêm công trình mới, trả về object đã lưu
// ---------------------------------------------------------------------------
export function addProject(data) {
  const projects = getProjects();
  const now = new Date().toISOString();

  const project = {
    projectId:    generateId(),
    projectName:  (data.projectName  || '').trim(),
    customerName: (data.customerName || '').trim(),
    address:      (data.address      || '').trim(),
    surveyPerson: (data.surveyPerson || '').trim(),
    department:   data.department || 'sale',
    surveyDate:   data.surveyDate || '',
    generalNote:  (data.generalNote  || '').trim(),
    imageCount:   0,
    createdAt:    now,
    updatedAt:    now,
  };

  saveProjects([project, ...projects]);

  storageLog('INFO', 'tạo-công-trình', 'addProject()',
    `Đã lưu "${project.projectName}"`, `projectId: ${project.projectId}`);

  return project;
}

// ---------------------------------------------------------------------------
// updateProject  —  cập nhật công trình đã có
// ---------------------------------------------------------------------------
export function updateProject(projectId, updates) {
  try {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.projectId === projectId);
    if (idx === -1) {
      storageLog('ERROR', 'chỉnh-sửa', 'updateProject()',
        `Không tìm thấy projectId: ${projectId}`);
      return null;
    }
    const updated = {
      ...projects[idx],
      ...updates,
      projectId,                          // bảo vệ ID không bị ghi đè
      updatedAt: new Date().toISOString(),
    };
    projects[idx] = updated;
    saveProjects(projects);
    storageLog('INFO', 'chỉnh-sửa', 'updateProject()',
      `Đã cập nhật "${updated.projectName}"`, `projectId: ${projectId}`);
    return updated;
  } catch (err) {
    storageLog('ERROR', 'chỉnh-sửa', 'updateProject()', 'Lỗi cập nhật', String(err));
    throw err;
  }
}

// ---------------------------------------------------------------------------
// deleteProject  —  xóa công trình theo ID
// ---------------------------------------------------------------------------
export function deleteProject(projectId) {
  try {
    const projects = getProjects();
    const filtered = projects.filter(p => p.projectId !== projectId);
    saveProjects(filtered);
    storageLog('INFO', 'xóa', 'deleteProject()',
      `Đã xóa projectId: ${projectId}`);
  } catch (err) {
    storageLog('ERROR', 'xóa', 'deleteProject()', 'Lỗi xóa', String(err));
    throw err;
  }
}

// ===========================================================================
// IMAGE STORAGE  (Prompt 5)
// ===========================================================================
export const IMAGES_KEY = 'mrcurtain_survey_images';

/**
 * Lấy danh sách ảnh của một công trình (lọc theo projectId).
 * Trả về [] nếu không có hoặc lỗi.
 */
export function getImages(projectId) {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw);
    if (!Array.isArray(all)) return [];
    return all
      .filter(img => img.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    storageLog('ERROR', 'chi-tiết', 'getImages()',
      'JSON.parse images thất bại', String(err));
    return [];
  }
}

/**
 * Lưu một ảnh mới. data phải có: { projectId, imagePreviewUrl }
 * Các trường khác (position, area, ...) để trống sẵn cho Prompt 6+.
 * @throws {{ type: 'QUOTA'|'SAVE_ERROR', message: string }} nếu lỗi lưu
 */
export function addImage(data) {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(all)) throw new Error('Images store không phải Array');

    const now = new Date().toISOString();
    const image = {
      imageId:         'img_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      projectId:       data.projectId,
      imagePreviewUrl: data.imagePreviewUrl,
      position:   '',
      area:       '',
      curtainType:'',
      productSpec:'',
      usageSpec:  '',
      width:      '',
      height:     '',
      unit:       'cm',
      notes:      '',
      tags:       [],
      createdAt:  now,
      updatedAt:  now,
    };

    localStorage.setItem(IMAGES_KEY, JSON.stringify([...all, image]));

    // Cập nhật imageCount trên project
    const projects = getProjects();
    const proj = projects.find(p => p.projectId === data.projectId);
    if (proj) {
      const cnt = getImages(data.projectId).length;
      updateProject(data.projectId, { imageCount: cnt });
    }

    storageLog('INFO', 'chi-tiết', 'addImage()',
      `Đã lưu ảnh cho project ${data.projectId}`, `imageId: ${image.imageId}`);
    return image;
  } catch (err) {
    const isQuota = err instanceof DOMException &&
      (err.code === 22 || err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    storageLog('ERROR', 'chi-tiết', 'addImage()',
      isQuota ? 'localStorage đã đầy (QuotaExceededError)' : 'Lỗi lưu ảnh',
      String(err));
    throw isQuota
      ? { type: 'QUOTA', message: 'Bộ nhớ trình duyệt đã đầy. Vui lòng xóa bớt ảnh cũ hoặc xóa cache.' }
      : { type: 'SAVE_ERROR', message: 'Lỗi lưu ảnh. Vui lòng thử lại.' };
  }
}

/**
 * Xóa ảnh theo imageId và cập nhật imageCount project.
 */
export function deleteImage(imageId, projectId) {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    if (!raw) return;
    const all = JSON.parse(raw);
    const filtered = all.filter(img => img.imageId !== imageId);
    localStorage.setItem(IMAGES_KEY, JSON.stringify(filtered));

    if (projectId) {
      const remaining = filtered.filter(img => img.projectId === projectId).length;
      updateProject(projectId, { imageCount: remaining });
    }

    storageLog('INFO', 'chi-tiết', 'deleteImage()', `Đã xóa imageId: ${imageId}`);
  } catch (err) {
    storageLog('ERROR', 'chi-tiết', 'deleteImage()', 'Lỗi xóa ảnh', String(err));
    throw err;
  }
}

/**
 * Nén ảnh bằng Canvas API — dùng trong môi trường browser.
 * @param {File} file  - file ảnh gốc
 * @param {number} maxWidth  - giới hạn chiều rộng px (default 900)
 * @param {number} quality   - JPEG quality 0–1 (default 0.72)
 * @returns {Promise<string>} base64/dataURL đã nén
 */
export function compressImage(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File không phải ảnh'));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        const maxH = 1200;
        if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (e) { URL.revokeObjectURL(objectUrl); reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Không đọc được file ảnh')); };
    img.src = objectUrl;
  });
}
