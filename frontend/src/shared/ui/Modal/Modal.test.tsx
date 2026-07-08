import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  // Store original rAF and restore after each test
  let rafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Mock requestAnimationFrame to fire the callback immediately
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    rafSpy.mockRestore();
    document.body.style.overflow = '';
  });

  // --- Open / close rendering ---

  it('does not render anything when open is false', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('does not have dialog in the DOM when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  // --- Title rendering ---

  it('renders the title when provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="My Modal Title">
        Content
      </Modal>,
    );
    expect(screen.getByText('My Modal Title')).toBeInTheDocument();
  });

  it('renders title in an h2 element', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Settings">
        Body
      </Modal>,
    );
    const heading = screen.getByRole('heading', { name: /settings/i });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  it('does not render a heading when title is not provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  // --- Children rendering ---

  it('renders children content', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p data-testid="child">Inside modal</p>
      </Modal>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Inside modal')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <span>First</span>
        <span>Second</span>
      </Modal>,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  // --- Close button ---

  it('renders a close button when title is provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Dismissible">
        Content
      </Modal>,
    );
    expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
  });

  it('does not render close button when title is not provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Test">
        Content
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  // --- Escape key ---

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for non-Escape keys', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        Content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'a' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  // --- Backdrop click ---

  it('calls onClose when clicking the backdrop overlay', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        Content
      </Modal>,
    );
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose} title="Test">
        <button data-testid="inside-btn">Inside</button>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('inside-btn'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  // --- Aria attributes ---

  it('has role="dialog" on the overlay', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal="true"', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('sets aria-label to the title when title is provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Welcome">
        Body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Welcome');
  });

  it('does not set aria-label when title is not provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Body
      </Modal>,
    );
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-label');
  });

  // --- Focus trap ---

  it('focuses the first focusable element on open', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <button data-testid="first-btn">First</button>
        <button>Second</button>
      </Modal>,
    );
    expect(screen.getByTestId('first-btn')).toHaveFocus();
  });

  it('does not crash when there are no focusable elements inside', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Just text content</p>
      </Modal>,
    );
    // activeElement should be the body or document — no crash occurred
    expect(document.activeElement).toBeInstanceOf(HTMLElement);
  });

  it('wraps focus to the first element when Tab is pressed on the last element', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <button data-testid="first">First</button>
        <button data-testid="last">Last</button>
      </Modal>,
    );
    // Manually focus the last button
    screen.getByTestId('last').focus();
    expect(screen.getByTestId('last')).toHaveFocus();

    // Tab should wrap to first
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByTestId('first')).toHaveFocus();
  });

  it('wraps focus to the last element when Shift+Tab is pressed on the first element', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <button data-testid="first">First</button>
        <button data-testid="last">Last</button>
      </Modal>,
    );
    // First element should already be focused from rAF
    expect(screen.getByTestId('first')).toHaveFocus();

    // Shift+Tab should wrap to last
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('last')).toHaveFocus();
  });

  it('allows normal Tab navigation between middle elements without wrapping', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <button data-testid="a">A</button>
        <button data-testid="b">B</button>
        <button data-testid="c">C</button>
      </Modal>,
    );
    // Focus "b" (middle element)
    screen.getByTestId('b').focus();
    expect(screen.getByTestId('b')).toHaveFocus();

    // Tab from "b" — not the last element, so no wrapping occurs
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByTestId('b')).toHaveFocus();

    // Shift+Tab from "b" — not the first element, so no wrapping
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByTestId('b')).toHaveFocus();
  });

  // --- Body overflow hidden ---

  it('sets body overflow to hidden when modal is open', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when modal is closed (unmounted)', () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('restores body overflow when modal is toggled closed via open prop change', () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={vi.fn()}>
        Content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe('');
  });
});
