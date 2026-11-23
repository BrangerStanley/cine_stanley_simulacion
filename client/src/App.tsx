import { useState } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ClientPage from './pages/ClientPage';
import BoxOfficePage from './pages/BoxOfficePage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import { clearSession, getRole } from './lib/api';
import type { Role } from './types';

function landingFor(role: Role | null): string {
  if (role === 'ADMIN') return 'admin';
  if (role === 'STAFF') return 'taquilla';
  return 'cartelera';
}

export default function App() {
  const [role, setRole] = useState<Role | null>(() => getRole() as Role | null);
  const [email, setEmail] = useState(() => localStorage.getItem('cinestanley_email') || '');
  const [view, setView] = useState<string>(() => landingFor(getRole() as Role | null));

  function handleLogin(newRole: string, newEmail: string) {
    const r = newRole as Role;
    setRole(r);
    setEmail(newEmail);
    localStorage.setItem('cinestanley_email', newEmail);
    setView(landingFor(r));
  }

  function handleLogout() {
    clearSession();
    localStorage.removeItem('cinestanley_email');
    setRole(null);
    setEmail('');
    setView('cartelera');
  }

  function navigate(next: string) {
    const allowed =
      role === 'ADMIN'
        ? ['admin', 'cartelera', 'taquilla']
        : role === 'STAFF'
          ? ['taquilla']
          : ['cartelera'];
    if (allowed.includes(next)) setView(next);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {role && (
        <Navbar role={role} email={email} onLogout={handleLogout} active={view} onNavigate={navigate} />
      )}
      <main className="flex flex-1 flex-col">
        {!role ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            {view === 'cartelera' && <ClientPage />}
            {view === 'taquilla' && <BoxOfficePage />}
            {view === 'admin' && <AdminPage />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
