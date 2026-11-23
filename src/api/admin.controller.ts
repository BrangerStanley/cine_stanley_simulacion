import { Request, Response } from 'express';
import prisma from '../database/client';

export async function getDashboardMetrics(req: Request, res: Response) {
  try {
    const totalReservations = await prisma.reservation.count({ where: { status: { not: 'CANCELLED' } } });
    const checkedInReservations = await prisma.reservation.count({ where: { status: 'CHECKED_IN' } });
    
    // Estimación financiera simple (ej: $10 por entrada)
    const totalIncome = totalReservations * 10;
    const attendanceRate = totalReservations > 0 ? (checkedInReservations / totalReservations) * 100 : 0;

    res.json({
      totalReservations,
      checkedInReservations,
      totalIncome,
      attendanceRate: attendanceRate.toFixed(2) + '%',
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
}

export async function getTheaters(req: Request, res: Response) {
  try {
    const theaters = await prisma.theater.findMany();
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener salas' });
  }
}

export async function createMovie(req: Request, res: Response) {
  try {
    const { title, duration, description, posterUrl, trailerUrl } = req.body;
    const movie = await prisma.movie.create({
      data: {
        title,
        duration: Number(duration),
        description,
        posterUrl: posterUrl || null,
        trailerUrl: trailerUrl || null,
      },
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear película' });
  }
}

export async function createFunction(req: Request, res: Response) {
  try {
    const { movieId, theaterId, startTime } = req.body;
    const func = await prisma.function.create({
      data: { movieId, theaterId, startTime: new Date(startTime) },
    });
    res.status(201).json(func);
  } catch (error) {
    res.status(500).json({ error: 'Error al programar función' });
  }
}
