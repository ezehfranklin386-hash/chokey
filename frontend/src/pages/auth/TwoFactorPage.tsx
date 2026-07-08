import { useState, useRef, type ClipboardEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useVerifyTwoFactor, useRecoveryCode } from '@/features/auth/useAuth';
import { cn } from '@/shared/lib/cn';

type TwoFactorMode = 'totp' | 'recovery';

export default function TwoFactorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const tempToken = (location.state as { tempToken?: string })?.tempToken;

  const [mode, setMode] = useState<TwoFactorMode>('totp');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [recoveryCode, setRecoveryCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyTwoFactor();
  const recoveryMutation = useRecoveryCode();
  const isSubmitting = verifyMutation.isPending || recoveryMutation.isPending;

  // If no temp token, redirect to sign in
  if (!tempToken) {
    navigate('/auth/sign-in', { replace: true });
    return null;
  }

  const handleDigitInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (value && index === 5 && newCode.every(Boolean)) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pasted.length !== 6) return;

    const newCode = pasted.split('');
    setCode(newCode);
    inputRefs.current[5]?.focus();

    handleVerify(pasted);
  };

  const handleVerify = (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('');
    if (codeToVerify.length !== 6) return;

    verifyMutation.mutate({
      code: codeToVerify,
      tempToken,
      trustDevice,
    });
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryCode.trim()) return;

    recoveryMutation.mutate({
      recoveryCode: recoveryCode.trim(),
      tempToken,
    });
  };

  // ── Recovery Mode ─────────────────────────────────────────
  if (mode === 'recovery') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-warning/20">
            <svg className="h-7 w-7 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Recovery Code</h1>
          <p className="mt-1 text-sm text-white-70">
            Enter one of your backup recovery codes
          </p>
        </div>

        <form onSubmit={handleRecoverySubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white-70">
              Recovery Code
            </label>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="XXXXX-XXXXX-XXXXX"
              className="w-full rounded-lg border border-primary-500 bg-primary-700 px-4 py-3 text-center font-mono text-lg text-white placeholder-white-50 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Verify Recovery Code
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode('totp')}
          className="block w-full text-center text-sm text-gold-500 hover:text-gold-400 transition-colors"
        >
          Back to authenticator code
        </button>
      </div>
    );
  }

  // ── TOTP Mode ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10">
          <svg className="h-7 w-7 text-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Two-Factor Authentication</h1>
        <p className="mt-1 text-sm text-white-70">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {/* Code inputs */}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              'h-14 w-11 rounded-lg border text-center text-xl font-bold text-white',
              'bg-primary-700 font-mono transition-all duration-200',
              'focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30',
              digit ? 'border-gold-500' : 'border-primary-500',
            )}
            disabled={isSubmitting}
            autoFocus={index === 0}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Trust this device */}
      <label className="flex items-center justify-center gap-2 text-sm text-white-70 cursor-pointer">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
          className="h-4 w-4 rounded border-primary-500 bg-primary-700 text-gold-500 focus:ring-gold-500/30 focus:ring-offset-0"
        />
        Trust this device for 30 days
      </label>

      {/* Verify button */}
      <Button
        fullWidth
        size="lg"
        onClick={() => handleVerify()}
        loading={isSubmitting}
        disabled={code.some((d) => !d) || isSubmitting}
      >
        Verify
      </Button>

      {/* Use recovery code */}
      <button
        type="button"
        onClick={() => setMode('recovery')}
        className="block w-full text-center text-sm text-gold-500 hover:text-gold-400 transition-colors"
      >
        Use a recovery code instead
      </button>

      {/* Back to sign in */}
      <p className="text-center text-sm text-white-70">
        <Link
          to="/auth/sign-in"
          className="text-gold-500 hover:text-gold-400 transition-colors"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
