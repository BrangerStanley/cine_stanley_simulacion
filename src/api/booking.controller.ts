import { Request, Response } from 'express';
import prisma from '../database/client';

export async function getMovies(req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      include: { functions: { include: { theater: true } } },
    });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cartelera' });
  }
}

export async function getFunctionSeats(req: Request, res: Response) {
  try {
    const functionId = String(req.params.functionId);
    const reservations = await prisma.reservation.findMany({
      where: { functionId, status: { not: 'CANCELLED' } },
      select: { seatNumber: true },
    });
    const occupiedSeats = reservations.map((r) => r.seatNumber);
    res.json({ occupiedSeats });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asientos' });
  }
}

export async function createReservation(req: Request, res: Response) {
  const { functionId, customerName, paymentProof } = req.body;
  const file = req.file as Express.Multer.File | undefined;

  let seatNumbers: string[] = [];
  try {
    seatNumbers = JSON.parse(req.body.seatNumbers || '[]');
  } catch {
    return res.status(400).json({ error: 'Formato de asientos inválido' });
  }

  if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un asiento' });
  }

  const proofText = typeof paymentProof === 'string' ? paymentProof.trim() : '';
  if (!proofText && !file) {
    return res.status(400).json({
      error: 'Debe enviar un comprobante de pago (imagen o texto)',
    });
  }

  const paymentImageUrl = file ? `/uploads/${file.filename}` : null;

  try {
    // Transacción atómica para evitar condiciones de carrera (Race Conditions)
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.reservation.findFirst({
        where: {
          functionId,
          seatNumber: { in: seatNumbers },
          status: { not: 'CANCELLED' },
        },
      });

      if (existing) {
        throw new Error(`El asiento ${existing.seatNumber} ya ha sido reservado.`);
      }

      const reservations = [];
      for (const seatNumber of seatNumbers) {
        const resv = await tx.reservation.create({
          data: {
            functionId,
            seatNumber,
            customerName,
            status: 'PENDING', // Pendiente de aprobación de pago por recepción
            paymentProof: proofText || null,
            paymentImageUrl,
          },
        });
        reservations.push(resv);
      }

      return reservations;
    });

    res.status(201).json({
      message: 'Reserva registrada. Pendiente de aprobación de pago por recepción.',
      reservations: result,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al procesar la reserva' });
  }
}
