import prisma from './client';
import bcrypt from 'bcryptjs';

async function main() {
  // Limpiar ejemplos anteriores
  await prisma.reservation.deleteMany();
  await prisma.function.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theater.deleteMany();
  await prisma.user.deleteMany();

  // Usuarios de prueba por rol
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cinestanley.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@cinestanley.com',
      password: hashedPassword,
      role: 'STAFF',
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@cinestanley.com',
      password: hashedPassword,
      role: 'CLIENT',
    },
  });

  // Salas
  const sala1 = await prisma.theater.create({
    data: { name: 'Sala 1 - IMAX', capacity: 50 },
  });
  const sala2 = await prisma.theater.create({
    data: { name: 'Sala 2 - Premium', capacity: 40 },
  });

  // Películas
  const interestelar = await prisma.movie.create({
    data: {
      title: 'Interstellar',
      duration: 169,
      description:
        'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio para asegurar la supervivencia de la humanidad.',
      posterUrl: '/interestellar.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    },
  });

  const odisea = await prisma.movie.create({
    data: {
      title: 'La Odisea',
      duration: 150,
      description:
        'La épica travesía de Odiseo en su largo regreso a Ítaca tras la guerra de Troya, enfrentando dioses, monstruos y su propio destino.',
      posterUrl: '/odisea.webp',
      trailerUrl: 'https://www.youtube.com/watch?v=Mzw2ttJD2qQ',
    },
  });

  // Funciones
  const manana = new Date(Date.now() + 86400000);
  const pasado = new Date(Date.now() + 2 * 86400000);

  await prisma.function.create({
    data: { movieId: interestelar.id, theaterId: sala1.id, startTime: manana },
  });
  await prisma.function.create({
    data: { movieId: interestelar.id, theaterId: sala1.id, startTime: pasado },
  });
  await prisma.function.create({
    data: { movieId: odisea.id, theaterId: sala2.id, startTime: manana },
  });
  await prisma.function.create({
    data: { movieId: odisea.id, theaterId: sala2.id, startTime: pasado },
  });

  console.log('Seed ejecutado correctamente:', {
    admin: admin.email,
    staff: staff.email,
    client: client.email,
    peliculas: [interestelar.title, odisea.title],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
