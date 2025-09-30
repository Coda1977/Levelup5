'use client';

import { useState } from 'react';

type MarkCompleteButtonProps = {
  chapterId: string;
  initialCompleted: boolean;
};

export function MarkCompleteButton({
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