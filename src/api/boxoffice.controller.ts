import { Request, Response } from 'express';
import prisma from '../database/client';
import type { AuthRequest } from './auth.controller';

export async function validateTicket(req: Request, res: Response) {
  const { reservationId } = req.body;

  if (!reservationId) {
    return res.status(400).json({ error: 'Código de reserva requerido' });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { function: { include: { movie: true, theater: true } } },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reserva no encontrada o inválida' });
    }

    if (reservation.status === 'PENDING') {
      return res.status(400).json({
        error: 'El pago aún no ha sido aprobado por recepción',
        status: 'PENDING',
        reservation,
      });
    }

    if (reservation.status === 'CANCELLED') {
      return res.status(400).json({
        error: 'La reserva fue rechazada o cancelada',
        status: 'CANCELLED',
        reservation,
      });
    }

    if (reservation.status === 'CHECKED_IN') {
      return res.status(400).json({
        error: 'Entrada ya utilizada previamente',
        status: 'CHECKED_IN',
        reservation,
      });
    }

    // Solo se permite el acceso si el pago está aprobado (PAID)
    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CHECKED_IN' },
      include: { function: { include: { movie: true, theater: true } } },
    });

    res.json({ message: 'Entrada válida. ¡Acceso permitido!', reservation: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al validar el ticket' });
  }
}

export async function getPendingPayments(req: Request, res: Response) {
  try {
    const pending = await prisma.reservation.findMany({
      where: { status: 'PENDING' },
      include: { function: { include: { movie: true, theater: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pagos pendientes' });
  }
}

export async function reviewPayment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { approve } = req.body as { approve?: boolean };

  if (typeof approve !== 'boolean') {
    return res.status(400).json({ error: 'Debe indicar si aprueba o rechaza el pago' });
  }

  try {
    const existing = await prisma.reservation.findUnique({ where: { id: String(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    if (existing.status !== 'PENDING') {
      return res.status(400).json({ error: 'La reserva ya fue revisada' });
    }

    const updated = await prisma.reservation.update({
      where: { id: String(id) },
      data: {
        status: approve ? 'PAID' : 'CANCELLED',
        reviewedBy: req.user?.email ?? null,
      },
    });

    res.json({
      message: approve ? 'Pago aprobado correctamente' : 'Pago rechazado',
      reservation: updated,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al revisar el pago' });
  }
}
