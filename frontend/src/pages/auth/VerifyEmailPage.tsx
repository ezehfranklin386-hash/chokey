import { useState, useRef, type ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { useVerifyEmail, useResendVerification } from '@/features/auth/useAuth';
import { cn } from '@/shared/lib/cn';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();
  const isSubmitting = verifyMutation.isPending || resendMutation.isPending;

  const startCountdown = () => {
    setCountdown(45);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDigitInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

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

    verifyMutation.mutate(
      { code: codeToVerify },
      {
        onSuccess: () => {
          navigate('/dashboard', { replace: true });
        },
      },
    );
  };

  const handleResend = () => {
    if (countdown > 0 || isSubmitting) return;
    resendMutation.mutate(undefined, {
      onSuccess: () => startCountdown(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500/10">
          <svg className="h-7 w-7 text-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Verify Your Email</h1>
        <p className="mt-1 text-sm text-white-70">
          We&apos;ve sent a 6-digit code to your email. Enter it below.
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

      {/* Verify button */}
      <Button
        fullWidth
        size="lg"
        onClick={() => handleVerify()}
        loading={verifyMutation.isPending}
        disabled={code.some((d) => !d) || isSubmitting}
      >
        Verify Email
      </Button>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-white-70">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isSubmitting}
            className={cn(
              'font-medium transition-colors',
              countdown > 0 || isSubmitting
                ? 'text-white-50 cursor-not-allowed'
                : 'text-gold-500 hover:text-gold-400',
            )}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
          </button>
        </p>
      </div>

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
