"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('committee' | 'member' | 'security')[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
        return;
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [router, allowedRoles, isAuthenticated, user]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // The useEffect will handle the redirect
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
