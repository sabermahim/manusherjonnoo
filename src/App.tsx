import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { AppealsPage } from './pages/AppealsPage.tsx';
import { UserDashboard } from './pages/UserDashboard.tsx';
import { VolunteerDashboard } from './pages/VolunteerDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { RequestDetailModal } from './components/RequestDetailModal.tsx';
import { CreateRequestModal } from './components/CreateRequestModal.tsx';
import { AuthModal } from './components/AuthModals.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';

function MainApp() {
  const { user, loading: authLoading } = useAuth();

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [exploreInitialCategory, setExploreInitialCategory] = useState<string>('সকল');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Modals
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<
    'LOGIN' | 'REGISTER_USER' | 'REGISTER_VOLUNTEER' | null
  >(null);

  // Role guarding effect: Protect against manual tab/URL manipulation and state shifts
  React.useEffect(() => {
    if (authLoading) return;

    if (currentTab === 'admin-dashboard') {
      if (!user) {
        setCurrentTab('home');
        setShowAdminLoginModal(true);
      } else if (user.role !== 'ADMIN') {
        setCurrentTab(user.role === 'VOLUNTEER' ? 'volunteer-dashboard' : 'user-dashboard');
        setAccessDeniedMessage('অননুমোদিত প্রবেশাধিকার: শুধুমাত্র অ্যাডমিন এই ড্যাশবোর্ডে প্রবেশ করতে পারেন।');
        setTimeout(() => setAccessDeniedMessage(null), 5000);
      }
    } else if (currentTab === 'volunteer-dashboard') {
      if (!user) {
        setCurrentTab('home');
        setAuthModalType('LOGIN');
      } else if (user.role !== 'VOLUNTEER') {
        setCurrentTab('home');
      }
    } else if (currentTab === 'user-dashboard') {
      if (!user) {
        setCurrentTab('home');
        setAuthModalType('LOGIN');
      } else if (user.role !== 'USER') {
        setCurrentTab('home');
      }
    }
  }, [currentTab, user, authLoading]);

  // When user logs out, redirect from protected dashboards to home
  React.useEffect(() => {
    if (!user && (currentTab === 'admin-dashboard' || currentTab === 'volunteer-dashboard' || currentTab === 'user-dashboard')) {
      setCurrentTab('home');
    }
  }, [user]);

  const handleOpenExploreWithCategory = (catName?: string) => {
    if (catName) {
      setExploreInitialCategory(catName);
    } else {
      setExploreInitialCategory('সকল');
    }
    setCurrentTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    // Guard against unauthenticated/unauthorized clicks directly
    if (tab === 'admin-dashboard') {
      if (!user || user.role !== 'ADMIN') {
        setShowAdminLoginModal(true);
        return;
      }
    } else if (tab === 'volunteer-dashboard') {
      if (!user) {
        setAuthModalType('LOGIN');
        return;
      }
      if (user.role !== 'VOLUNTEER') {
        alert('এই ড্যাশবোর্ডটি শুধুমাত্র নিবন্ধিত স্বেচ্ছাসেবকদের জন্য।');
        return;
      }
    } else if (tab === 'user-dashboard') {
      if (!user) {
        setAuthModalType('LOGIN');
        return;
      }
      if (user.role !== 'USER') {
        alert('এই ড্যাশবোর্ডটি সাধারণ ব্যবহারকারীদের জন্য।');
        return;
      }
    }

    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-bengali">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenCreateRequest={() => setShowCreateModal(true)}
        onOpenLogin={() => setAuthModalType('LOGIN')}
        onOpenUserRegister={() => setAuthModalType('REGISTER_USER')}
        onOpenVolunteerRegister={() => setAuthModalType('REGISTER_VOLUNTEER')}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

      {/* Access Denied Toast / Alert */}
      {accessDeniedMessage && (
        <div className="bg-rose-600 text-white text-xs sm:text-sm font-bold px-4 py-3 text-center flex items-center justify-center gap-2 shadow-md">
          <span>⚠️ {accessDeniedMessage}</span>
          <button
            onClick={() => setAccessDeniedMessage(null)}
            className="ml-3 underline hover:opacity-80 cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onOpenCreateRequest={() => setShowCreateModal(true)}
            onOpenVolunteerRegister={() => setAuthModalType('REGISTER_VOLUNTEER')}
            onNavigateToExplore={handleOpenExploreWithCategory}
            onSelectRequest={(id) => setSelectedRequestId(id)}
          />
        )}

        {currentTab === 'explore' && (
          <ExplorePage
            key={exploreInitialCategory}
            initialCategory={exploreInitialCategory}
            onSelectRequest={(id) => setSelectedRequestId(id)}
            onOpenCreateRequest={() => setShowCreateModal(true)}
          />
        )}

        {currentTab === 'appeals' && (
          <AppealsPage
            onSelectRequest={(id) => setSelectedRequestId(id)}
            onOpenVolunteerRegister={() => setAuthModalType('REGISTER_VOLUNTEER')}
            onOpenLogin={() => setAuthModalType('LOGIN')}
          />
        )}

        {currentTab === 'user-dashboard' && user?.role === 'USER' && (
          <UserDashboard
            onOpenCreateRequest={() => setShowCreateModal(true)}
            onSelectRequest={(id) => setSelectedRequestId(id)}
          />
        )}

        {currentTab === 'volunteer-dashboard' && user?.role === 'VOLUNTEER' && (
          <VolunteerDashboard
            onSelectRequest={(id) => setSelectedRequestId(id)}
          />
        )}

        {currentTab === 'admin-dashboard' && user?.role === 'ADMIN' && (
          <AdminDashboard
            onSelectRequest={(id) => setSelectedRequestId(id)}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleTabChange}
        onOpenCreateRequest={() => setShowCreateModal(true)}
        onOpenVolunteerRegister={() => setAuthModalType('REGISTER_VOLUNTEER')}
      />

      {/* Request Detail Modal */}
      {selectedRequestId && (
        <RequestDetailModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onOpenLogin={() => setAuthModalType('LOGIN')}
        />
      )}

      {/* Create Help Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newId) => {
            setShowCreateModal(false);
            setSelectedRequestId(newId);
          }}
          onOpenLogin={() => {
            setShowCreateModal(false);
            setAuthModalType('LOGIN');
          }}
        />
      )}

      {/* Authentication Modal */}
      {authModalType && (
        <AuthModal
          type={authModalType}
          onClose={() => setAuthModalType(null)}
          onSwitchType={(type) => setAuthModalType(type)}
          onOpenAdminLogin={() => {
            setAuthModalType(null);
            setShowAdminLoginModal(true);
          }}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={() => {
          setShowAdminLoginModal(false);
          setCurrentTab('admin-dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
