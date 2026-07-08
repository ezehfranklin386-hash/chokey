import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  // --- Variants ---

  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-gold-500');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button.className).toContain('border-gold-500');
    expect(button.className).toContain('text-gold-500');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button', { name: /ghost/i });
    expect(button.className).toContain('bg-transparent');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: /danger/i });
    expect(button.className).toContain('bg-market-red');
    expect(button.className).toContain('text-white');
  });

  // --- Sizes ---

  it('renders with sm size', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button', { name: /small/i });
    expect(button.className).toContain('px-3');
    expect(button.className).toContain('py-1.5');
    expect(button.className).toContain('text-sm');
  });

  it('renders with md size (default)', () => {
    render(<Button size="md">Medium</Button>);
    const button = screen.getByRole('button', { name: /medium/i });
    expect(button.className).toContain('px-6');
    expect(button.className).toContain('py-3');
    expect(button.className).toContain('text-md');
    expect(button.className).toContain('rounded-lg');
  });

  it('renders with lg size', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button', { name: /large/i });
    expect(button.className).toContain('px-8');
    expect(button.className).toContain('py-4');
    expect(button.className).toContain('text-lg');
    expect(button.className).toContain('rounded-lg');
  });

  // --- Loading state ---

  it('renders a spinner and is disabled when loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    expect(button).toBeDisabled();

    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders spinner before children', () => {
    const { container } = render(<Button loading>Save</Button>);
    const button = container.querySelector('button');
    const firstChild = button?.firstChild as HTMLElement | null;
    expect(firstChild?.tagName).toBe('svg');
  });

  it('does not render spinner when not loading', () => {
    const { container } = render(<Button>Save</Button>);
    const spinner = container.querySelector('svg.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });

  // --- Disabled state ---

  it('renders as disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button.className).toContain('disabled:cursor-not-allowed');
    expect(button.className).toContain('disabled:opacity-50');
  });

  // --- fullWidth ---

  it('applies w-full class when fullWidth is true', () => {
    render(<Button fullWidth>Full</Button>);
    const button = screen.getByRole('button', { name: /full/i });
    expect(button.className).toContain('w-full');
  });

  it('does not apply w-full when fullWidth is false', () => {
    render(<Button fullWidth={false}>Not Full</Button>);
    const button = screen.getByRole('button', { name: /not full/i });
    expect(button.className).not.toContain('w-full');
  });

  // --- Click handler ---

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Clickable</Button>);
    await user.click(screen.getByRole('button', { name: /clickable/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={handleClick}>
        Noop
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: /noop/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button loading onClick={handleClick}>
        Busy
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: /busy/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- Rendering children ---

  it('renders children text', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders complex children (multiple elements)', () => {
    render(
      <Button>
        <span data-testid="icon">*</span>
        <span>With Icon</span>
      </Button>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  // --- Focus-visible ring classes ---

  it('includes focus-visible ring classes for primary variant', () => {
    render(<Button variant="primary">Focused</Button>);
    const button = screen.getByRole('button', { name: /focused/i });
    expect(button.className).toContain('focus-visible:ring-2');
    expect(button.className).toContain('focus-visible:ring-gold-500/50');
  });

  it('includes focus-visible ring classes for danger variant', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: /danger/i });
    expect(button.className).toContain('focus-visible:ring-2');
    expect(button.className).toContain('focus-visible:ring-market-red/50');
  });

  it('includes focus-visible:outline-none for every variant', () => {
    render(<Button>Any Button</Button>);
    const button = screen.getByRole('button', { name: /any button/i });
    expect(button.className).toContain('focus-visible:outline-none');
  });

  // --- Additional props passthrough ---

  it('passes type attribute to the button element', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('applies custom className alongside component classes', () => {
    render(<Button className="custom-class">Styled</Button>);
    const button = screen.getByRole('button', { name: /styled/i });
    expect(button.className).toContain('custom-class');
  });

  // --- displayName ---

  it('has displayName set to "Button"', () => {
    expect(Button.displayName).toBe('Button');
  });
});
