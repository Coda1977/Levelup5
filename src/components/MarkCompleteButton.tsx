'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type MarkCompleteButtonProps = {
  chapterId: string;
  initialCompleted: boolean;
};

// Client component that wraps MarkCompleteButton with auth context
export function MarkCompleteButtonWrapper({
  chapterId,
  initialCompleted,
}: MarkCompleteButtonProps) {
  const { session, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-500">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <button
        onClick={() => {
          alert('Please log in to track your progress.');
          window.location.href = '/auth/login';
        }}
        className="px-6 py-3 rounded-xl font-semibold bg-accent-yellow text-text-primary hover:bg-opacity-90 transition-all"
      >
        Log in to Track Progress
      </button>
    );
  }

  return (
    <MarkCompleteButton chapterId={chapterId} initialCompleted={initialCompleted} />
  );
}

function MarkCompleteButton({
  chapterId,
  initialCompleted,
}: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isCompleted) {
        // Remove progress
        const res = await fetch('/api/progress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId }),
        });

        if (!res.ok) {
          throw new Error('Failed to remove progress');
        }

        setIsCompleted(false);
      } else {
        // Mark as complete
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId }),
        });

        if (!res.ok) {
          throw new Error('Failed to mark as complete');
        }

        setIsCompleted(true);
      }
    } catch (error) {
      console.error('Error toggling progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        px-6 py-3 rounded-xl font-semibold transition-all
        ${
          isCompleted
            ? 'bg-accent-green text-white hover:bg-opacity-90'
            : 'bg-accent-yellow text-text-primary hover:bg-opacity-90'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? (
        <span>Updating...</span>
      ) : isCompleted ? (
        <span>✓ Completed</span>
      ) : (
        <span>Mark as Complete</span>
      )}
    </button>
  );
}