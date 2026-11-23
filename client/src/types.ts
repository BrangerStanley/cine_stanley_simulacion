export type Role = 'CLIENT' | 'STAFF' | 'ADMIN';

export interface Theater {
  id: string;
  name: string;
  capacity: number;
}

export interface Movie {
  id: string;
  title: string;
  duration: number;
  description: string;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  functions: FunctionItem[];
}

export interface FunctionItem {
  id: string;
  movieId: string;
  theaterId: string;
  startTime: string;
  theater: Theater;
}

export interface Reservation {
  id: string;
  functionId: string;
  seatNumber: string;
  status: string;
  customerName: string;
  paymentProof?: string | null;
  paymentImageUrl?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  function?: {
    movie: Movie;
    theater: Theater;
    startTime: string;
  };
}

export interface Metrics {
  totalReservations: number;
  checkedInReservations: number;
  totalIncome: number;
  attendanceRate: string;
}
