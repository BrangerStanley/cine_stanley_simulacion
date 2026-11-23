# CineStanley - Sistema de Gestión y Reserva de Cine

CineStanley es una aplicación web profesional diseñada para simular la operación integral de un cine, enfocada en la gestión de carteleras, reserva de asientos en tiempo real y validación de boletos.

## 1. Vistas Principales
*   **Cliente Externo:** Exploración de cartelera, selección de asientos y generación de boletos digitales.
*   **Recepcionista / Taquilla:** Validación rápida de entradas mediante código único, evitando el fraude por duplicidad.
*   **Dueño / Administrador:** Tablero de control financiero, gestión de catálogo (películas/salas/funciones) y supervisión operativa.

## 2. Sistema Visual
La interfaz usa fondos oscuros y acentos verdes y naranjas para destacar estados, asientos seleccionados y acciones principales.

## 3. Arquitectura y Modelo de Datos
*   **Stack:** React (TS), Node.js/Express, PostgreSQL, Prisma.
*   **Reglas de Negocio:**
    *   Las reservas seleccionadas se crean dentro de una transacción de Prisma.
    *   Ciclo de vida de reserva controlado: `PENDING` -> `PAID` -> `CHECKED_IN` / `CANCELLED`.

## 4. Autenticación y datos de demostración
*   La API aplica controles por rol (`CLIENT`, `STAFF`, `ADMIN`).
*   Las contraseñas se almacenan con hash bcrypt y la API usa tokens JWT; el cliente conserva el token en `localStorage`.
*   Las cuentas y contraseñas de prueba de este README son solo para desarrollo local. No las reutilices ni expongas una instancia pública con esas cuentas.
*   `npm run db:seed` elimina primero los datos existentes y los reemplaza con datos de demostración. Ejecútalo únicamente en una base local desechable.

## 5. Guía de Ejecución Local
1.  Crear una base de datos PostgreSQL local y copiar `.env.example` a `.env`.
2.  Completar `DATABASE_URL` y reemplazar `JWT_SECRET` por un valor aleatorio privado. Nunca publiques `.env`; el `.gitignore` de este proyecto lo excluye.
3.  Desde la raíz del proyecto, ejecutar `npm install` y `npx prisma db push`.
4.  Opcional para una base local vacía: ejecutar `npm run db:seed` para crear las cuentas, películas y funciones de prueba.
5.  Iniciar la API con `npm run dev` (http://localhost:3000).
6.  En otra terminal, ejecutar `cd client`, `npm install` y `npm run dev` (http://localhost:5173). Vite reenvía las peticiones `/api` a la API local.

### Cuentas de prueba
| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Cliente | client@cinestanley.com | password123 |
| Recepcionista | staff@cinestanley.com | password123 |
| Administrador | admin@cinestanley.com | password123 |

