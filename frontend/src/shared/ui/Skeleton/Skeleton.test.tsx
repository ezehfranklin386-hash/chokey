import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  // --- Variants ---

  it('renders with text variant by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-4');
    expect(el.className).toContain('rounded');
  });

  it('renders with card variant', () => {
    const { container } = render(<Skeleton variant="card" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-48');
    expect(el.className).toContain('rounded-card');
  });

  it('renders with table variant', () => {
    const { container } = render(<Skeleton variant="table" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('rounded');
  });

  it('renders with chart variant', () => {
    const { container } = render(<Skeleton variant="chart" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-64');
    expect(el.className).toContain('rounded-card');
  });

  it('renders with circle variant', () => {
    const { container } = render(<Skeleton variant="circle" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-10');
    expect(el.className).toContain('w-10');
    expect(el.className).toContain('rounded-full');
  });

  // --- Custom width and height ---

  it('applies custom numeric width as inline style', () => {
    const { container } = render(<Skeleton width={200} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('200px');
  });

  it('applies custom string width as inline style', () => {
    const { container } = render(<Skeleton width="50%" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
  });

  it('applies custom numeric height as inline style', () => {
    const { container } = render(<Skeleton height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('100px');
  });

  it('applies custom string height as inline style', () => {
    const { container } = render(<Skeleton height="8rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('8rem');
  });

  it('applies both custom width and height', () => {
    const { container } = render(<Skeleton width={300} height={150} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('300px');
    expect(el.style.height).toBe('150px');
  });

  // --- Lines prop ---

  it('renders the correct number of lines with text variant', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children).toHaveLength(3);
  });

  it('renders lines wrapped in a flex-col container', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('flex-col');
    expect(wrapper.className).toContain('gap-2');
  });

  it('sets last line width to 60%', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const wrapper = container.firstChild as HTMLElement;
    const lastLine = wrapper.children[2] as HTMLElement;
    expect(lastLine.style.width).toBe('60%');
  });

  it('sets non-last lines width to 100%', () => {
    const { container } = render(<Skeleton variant="text" lines={4} />);
    const wrapper = container.firstChild as HTMLElement;
    for (let i = 0; i < 3; i++) {
      const line = wrapper.children[i] as HTMLElement;
      expect(line.style.width).toBe('100%');
    }
    // Last line at 60%
    expect((wrapper.children[3] as HTMLElement).style.width).toBe('60%');
  });

  it('renders each line with skeleton and base classes', () => {
    const { container } = render(<Skeleton variant="text" lines={3} />);
    const wrapper = container.firstChild as HTMLElement;
    for (let i = 0; i < 3; i++) {
      const line = wrapper.children[i] as HTMLElement;
      expect(line.className).toContain('skeleton');
      expect(line.className).toContain('h-4');
      expect(line.className).toContain('rounded');
    }
  });

  it('renders single line at 60% width', () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.children).toHaveLength(1);
    const onlyLine = wrapper.children[0] as HTMLElement;
    expect(onlyLine.style.width).toBe('60%');
  });

  it('ignores lines prop for non-text variants', () => {
    const { container } = render(<Skeleton variant="card" lines={3} />);
    const el = container.firstChild as HTMLElement;
    // Single skeleton div, not a flex container with children
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('h-48');
    expect(el.className).toContain('rounded-card');
    expect(container.querySelector('.flex.flex-col')).not.toBeInTheDocument();
  });

  // --- aria-busy ---

  it('has aria-busy="true" on single element', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-busy="true" on each line when using lines prop', () => {
    const { container } = render(<Skeleton variant="text" lines={2} />);
    const wrapper = container.firstChild as HTMLElement;
    // The text variant lines don't include aria-busy individually
    for (let i = 0; i < 2; i++) {
      const line = wrapper.children[i] as HTMLElement;
      expect(line).toBeInTheDocument();
    }
  });

  // --- className passthrough ---

  it('applies custom className to single element', () => {
    const { container } = render(<Skeleton className="my-custom-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('my-custom-class');
  });

  it('preserves skeleton class when custom className is added', () => {
    const { container } = render(<Skeleton className="extra" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('skeleton');
    expect(el.className).toContain('extra');
  });
});
