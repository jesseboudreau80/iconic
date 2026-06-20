import axios from 'axios'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('iconic_token')
}

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, full_name?: string) =>
    api.post('/auth/register', { email, password, full_name }),
  me:       (token: string) => api.get('/auth/me', { params: { token } }),
}

// ── Iconic ────────────────────────────────────────────────────────────────────
export const iconicApi = {
  // Projects
  listProjects:    () => api.get('/iconic/projects'),
  createProject:   (data: { name: string; description?: string }) => api.post('/iconic/projects', data),
  getProject:      (id: string) => api.get(`/iconic/projects/${id}`),
  updateProject:   (id: string, data: object) => api.put(`/iconic/projects/${id}`, data),

  // Brand DNA
  createDNA:       (id: string, data: object) => api.post(`/iconic/projects/${id}/brand-dna`, data),
  updateDNA:       (id: string, data: object) => api.put(`/iconic/projects/${id}/brand-dna`, data),
  listVersions:    (id: string) => api.get(`/iconic/projects/${id}/versions`),
  listTemplates:   () => api.get('/iconic/templates'),

  // Assets
  listAssetTypes:  () => api.get('/iconic/asset-types'),
  listRequests:    (pid: string) => api.get(`/iconic/projects/${pid}/assets`),
  createRequest:   (pid: string, data: object) => api.post(`/iconic/projects/${pid}/assets`, data),
  listGenerations: (pid: string, rid: string) => api.get(`/iconic/projects/${pid}/assets/${rid}/generations`),
  generateAsset:   (pid: string, rid: string) => api.post(`/iconic/projects/${pid}/assets/${rid}/generate`, { provider: 'gemini' }),

  // Orders
  listBundles:     () => api.get('/iconic/bundles'),
  createOrder:     (data: object) => api.post('/iconic/orders', data),
  packageOrder:    (orderId: string) => api.post(`/iconic/orders/${orderId}/package`),
  getDelivery:     (token: string) => api.get(`/iconic/delivery/${token}`),

  // Billing
  getBillingStatus:  () => api.get('/iconic/billing/status'),
  createCheckout:    (plan: string) => api.post(`/iconic/billing/checkout/${plan}`),
  createPortal:      () => api.post('/iconic/billing/portal'),
}
