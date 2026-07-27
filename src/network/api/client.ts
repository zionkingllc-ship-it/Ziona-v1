type RequestOptions = {
  headers?: Record<string, string>
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ziona.app'

async function request(method: string, path: string, body?: unknown, options?: RequestOptions) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`API ${method} ${path} failed (${res.status}): ${errBody}`)
  }
  return res.json()
}

export function get(path: string, options?: RequestOptions) {
  return request('GET', path, undefined, options)
}

export function post(path: string, body?: unknown, options?: RequestOptions) {
  return request('POST', path, body, options)
}

export function put(path: string, body?: unknown, options?: RequestOptions) {
  return request('PUT', path, body, options)
}

export function del(path: string, options?: RequestOptions) {
  return request('DELETE', path, undefined, options)
}
