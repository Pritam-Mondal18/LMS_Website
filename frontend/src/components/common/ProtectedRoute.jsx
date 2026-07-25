import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultDashboard =
      user.role === 'admin' ? `/admin/${user._id || user.id}` :
      user.role === 'teacher' ? `/teacher/${user._id || user.id}` : `/student/${user._id || user.id}`;
    return <Navigate to={defaultDashboard} replace />;
  }

  return children;
}
