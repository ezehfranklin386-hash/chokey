import { cn } from '@/shared/lib/cn';
import {
  type PasswordStrength,
  getPasswordStrength,
  passwordStrengthLabels,
  passwordStrengthColors,
} from './validation';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const strength: PasswordStrength = getPasswordStrength(password);

  if (strength === 'empty') return null;

  const bars = {
    weak: 1,
    medium: 2,
    strong: 3,
  };

  return (
    <div className="mt-2 space-y-1">
      {/* Progress bars */}
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              level <= bars[strength]
                ? passwordStrengthColors[strength]
                : 'bg-primary-500',
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p
        className={cn(
          'text-xs font-medium',
          strength === 'weak' && 'text-market-red',
          strength === 'medium' && 'text-warning',
          strength === 'strong' && 'text-market-green',
        )}
      >
        {passwordStrengthLabels[strength]}
      </p>

      {/* Requirements checklist */}
      <ul className="space-y-0.5 text-xs text-white-50">
        <li className={password.length >= 12 ? 'text-market-green' : ''}>
          {password.length >= 12 ? '✓' : '•'} At least 12 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-market-green' : ''}>
          {/[A-Z]/.test(password) ? '✓' : '•'} Uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-market-green' : ''}>
          {/[a-z]/.test(password) ? '✓' : '•'} Lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-market-green' : ''}>
          {/[0-9]/.test(password) ? '✓' : '•'} Number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-market-green' : ''}>
          {/[^A-Za-z0-9]/.test(password) ? '✓' : '•'} Special character
        </li>
      </ul>
    </div>
  );
}
