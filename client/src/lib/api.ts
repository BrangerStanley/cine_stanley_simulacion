const TOKEN_KEY = 'cinestanley_token';
const ROLE_KEY = 'cinestanley_role';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function saveSession(token: string, role: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Error ${res.status}`);
  }
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; role: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  movies: () => request<import('../types').Movie[]>('/api/movies'),

  theaters: () => request<import('../types').Theater[]>('/api/theaters'),

  seats: (functionId: string) =>
    request<{ occupiedSeats: string[] }>(`/api/functions/${functionId}/seats`),

  createReservation: (
    functionId: string,
    seatNumbers: string[],
    customerName: string,
    paymentProof: string,
    paymentImage?: File | null,
  ) => {
    const form = new FormData();
    form.append('functionId', functionId);
    form.append('seatNumbers', JSON.stringify(seatNumbers));
    form.append('customerName', customerName);
    form.append('paymentProof', paymentProof);
    if (paymentImage) form.append('paymentProofImage', paymentImage);

    return request<{ message: string; reservations: import('../types').Reservation[] }>(
      '/api/bookings',
      { method: 'POST', body: form },
      true,
    );
  },

  validateTicket: (reservationId: string) =>
    request<{ message: string; reservation: import('../types').Reservation }>(
      '/api/boxoffice/validate',
      { method: 'POST', body: JSON.stringify({ reservationId }) },
      true,
    ),

  pendingPayments: () =>
    request<import('../types').Reservation[]>('/api/boxoffice/pending', {}, true),

  reviewPayment: (id: string, approve: boolean) =>
    request<{ message: string; reservation: import('../types').Reservation }>(
      `/api/boxoffice/review/${id}`,
      { method: 'POST', body: JSON.stringify({ approve }) },
      true,
    ),

  metrics: () => request<import('../types').Metrics>('/api/admin/metrics', {}, true),

  createMovie: (payload: {
    title: string;
    duration: number;
    description: string;
    posterUrl?: string;
    trailerUrl?: string;
  }) => request('/api/admin/movies', { method: 'POST', body: JSON.stringify(payload) }, true),

  createFunction: (payload: { movieId: string; theaterId: string; startTime: string }) =>
    request('/api/admin/functions', { method: 'POST', body: JSON.stringify(payload) }, true),
};
