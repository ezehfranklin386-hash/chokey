import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  // --- Label rendering and htmlFor/id association ---

  it('renders a label element when label prop is provided', () => {
    render(<Input label="Email" />);
    const label = screen.getByText('Email');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('associates label with input via htmlFor and id', () => {
    render(<Input label="Username" />);
    const input = screen.getByLabelText('Username');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'username');
  });

  it('uses provided id instead of deriving from label', () => {
    render(<Input label="Email" id="custom-email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'custom-email');
  });

  it('does not render label when label is not provided', () => {
    const { container } = render(<Input />);
    expect(container.querySelectorAll('label')).toHaveLength(0);
  });

  // --- Error state ---

  it('renders error message with role="alert"', () => {
    render(<Input label="Password" error="Password is required" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Password is required');
  });

  it('sets aria-invalid="true" on input when error is present', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby pointing to the error element', () => {
    render(<Input label="Email" error="Invalid format" />);
    const input = screen.getByLabelText('Email');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId).toBe('email-error');
    expect(document.getElementById(errorId!)).toHaveTextContent('Invalid format');
  });

  it('does not set aria-invalid when no error', () => {
    render(<Input label="Name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'false');
  });

  it('renders error with market-red styling', () => {
    render(<Input label="Code" error="Wrong" />);
    expect(screen.getByRole('alert').className).toContain('text-market-red');
  });

  it('applies error border to the input wrapper', () => {
    const { container } = render(<Input label="Pin" error="Invalid" />);
    const wrapper = container.querySelector('.flex.items-center');
    expect(wrapper?.className).toContain('border-market-red');
  });

  it('hides helper text when error is present', () => {
    render(<Input label="Email" helperText="Enter your email" error="Required" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // --- Helper text ---

  it('renders helper text when provided and no error', () => {
    render(<Input label="Email" helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('sets aria-describedby pointing to helper text', () => {
    render(<Input label="Email" helperText="Optional" />);
    const input = screen.getByLabelText('Email');
    const helperId = input.getAttribute('aria-describedby');
    expect(helperId).toBe('email-helper');
    expect(document.getElementById(helperId!)).toHaveTextContent('Optional');
  });

  it('renders helper text with white-50 styling', () => {
    render(<Input label="Name" helperText="Your full name" />);
    expect(screen.getByText('Your full name').className).toContain('text-white-50');
  });

  // --- Value change via onChange ---

  it('calls onChange when user types', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Input label="Name" onChange={handleChange} />);
    await user.type(screen.getByLabelText('Name'), 'John');
    expect(handleChange).toHaveBeenCalledTimes(4);
  });

  it('reflects the value prop', () => {
    render(<Input label="Email" value="test@example.com" readOnly />);
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
  });

  // --- Prefix rendering ---

  it('renders prefix element', () => {
    render(<Input label="Amount" prefix={<span data-testid="prefix-icon">$</span>} />);
    expect(screen.getByTestId('prefix-icon')).toBeInTheDocument();
  });

  it('renders prefix before the input element in the DOM order', () => {
    const { container } = render(<Input label="Amount" prefix={<span>$</span>} />);
    const wrapper = container.querySelector('.flex.items-center');
    const prefixSpan = wrapper?.querySelector('.pl-3');
    const input = wrapper?.querySelector('input');
    expect(prefixSpan).toBeInTheDocument();
    expect(prefixSpan?.nextElementSibling).toBe(input);
  });

  it('applies pl-2 class to input when prefix is present', () => {
    render(<Input label="Amount" prefix={<span>$</span>} />);
    expect(screen.getByLabelText('Amount').className).toContain('pl-2');
  });

  // --- Suffix rendering ---

  it('renders suffix element', () => {
    render(<Input label="Search" suffix={<span data-testid="suffix-icon">X</span>} />);
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('renders suffix after the input element in the DOM order', () => {
    const { container } = render(<Input label="Search" suffix={<span>X</span>} />);
    const wrapper = container.querySelector('.flex.items-center');
    const input = wrapper?.querySelector('input');
    const suffixSpan = wrapper?.querySelector('.pr-3');
    expect(suffixSpan).toBeInTheDocument();
    expect(input?.nextElementSibling).toBe(suffixSpan);
  });

  it('applies pr-2 class to input when suffix is present', () => {
    render(<Input label="Search" suffix={<span>X</span>} />);
    expect(screen.getByLabelText('Search').className).toContain('pr-2');
  });

  // --- Prefix and suffix together ---

  it('renders both prefix and suffix simultaneously', () => {
    const { container } = render(
      <Input
        label="Token"
        prefix={<span data-testid="left">[</span>}
        suffix={<span data-testid="right">]</span>}
      />,
    );
    const wrapper = container.querySelector('.flex.items-center');
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(wrapper?.children).toHaveLength(3); // prefix, input, suffix
  });

  // --- className passthrough ---

  it('forwards className to the input element', () => {
    render(<Input label="Name" className="extra-class" />);
    expect(screen.getByLabelText('Name').className).toContain('extra-class');
  });

  it('preserves built-in input classes when className is passed', () => {
    render(<Input label="Name" className="custom" />);
    const input = screen.getByLabelText('Name');
    expect(input.className).toContain('bg-transparent');
    expect(input.className).toContain('font-mono');
    expect(input.className).toContain('custom');
  });

  // --- displayName ---

  it('has displayName set to "Input"', () => {
    expect(Input.displayName).toBe('Input');
  });
});
