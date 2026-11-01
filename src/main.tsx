import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import AdminLeaderboardPage from './components/AdminLeaderboardPage.tsx';

function Root() {
  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname.toLowerCase() || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route riêng biệt dành cho trang Admin: /admin hoặc /admin/
  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    window.location.hash === '#/admin' ||
    window.location.search.includes('admin=true');

  if (isAdminRoute) {
    return (
      <div className="w-full h-screen bg-slate-900 flex justify-center items-center p-0 sm:p-4">
        <div className="w-full h-full max-w-4xl max-h-[920px] bg-slate-900 sm:rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
          <AdminLeaderboardPage />
        </div>
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
