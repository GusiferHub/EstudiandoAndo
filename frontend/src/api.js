const runtimeConfig = window.__APP_CONFIG__ ?? {};
const API_URL = runtimeConfig.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);

  if (!response.ok) {
    let message = 'No se pudo completar la solicitud.';

    try {
      const payload = await response.json();
      message = payload.error?.message ?? message;
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function createStudyMaterial(file) {
  const formData = new FormData();
  formData.append('pdf', file);

  return request('/api/study-materials', {
    method: 'POST',
    body: formData
  });
}

export function listStudyMaterials() {
  return request('/api/study-materials');
}

export function deleteStudyMaterial(id) {
  return request(`/api/study-materials/${id}`, {
    method: 'DELETE'
  });
}

