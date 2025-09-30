import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkCompleteButton } from '../MarkCompleteButton';

// Mock fetch globally
global.fetch = jest.fn();

describe('MarkCompleteButton', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Initial State', () => {
    it('should render "Mark as Complete" when not completed', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      expect(screen.getByText('Mark as Complete')).toBeInTheDocument();
    });

    it('should render "✓ Completed" when completed', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={true} />);
      expect(screen.getByText('✓ Completed')).toBeInTheDocument();
    });

    it('should have correct styling for incomplete state', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent-yellow');
    });

    it('should have correct styling for completed state', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-accent-green');
    });
  });

  describe('Mark as Complete', () => {
    it('should call POST API when marking as complete', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      render(<MarkCompleteButton chapterId="chapter-123" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId: 'chapter-123' }),
        });
      });
    });

    it('should update button text after successful completion', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Completed')).toBeInTheDocument();
      });
    });

    it('should show loading state during API call', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });
    });

    it('should disable button during API call', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
      );

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Unmark Completion', () => {
    it('should call DELETE API when unmarking', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<MarkCompleteButton chapterId="chapter-456" initialCompleted={true} />);
      const button = screen.getByText('✓ Completed');

      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/progress', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId: 'chapter-456' }),
        });
      });
    });

    it('should update button text after successful removal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={true} />);
      const button = screen.getByText('✓ Completed');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Mark as Complete')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show alert on API failure', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Failed to update progress. Please try again.');
      });

      alertSpy.mockRestore();
    });

    it('should not change state on API failure', async () => {
      jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Mark as Complete')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByText('Mark as Complete');

      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalled();
      });

      alertSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should be a button element', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<MarkCompleteButton chapterId="test-id" initialCompleted={false} />);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });
});