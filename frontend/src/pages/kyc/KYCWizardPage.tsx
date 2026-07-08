import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { Button, Input } from '@/shared/ui';
import { useKycStatus, useSubmitKyc } from '@/features/kyc/useKyc';
import type { KycStep, KycPersonalInfo } from '@/entities/kyc/kyc.types';

const STEPS: { key: KycStep; label: string; number: number }[] = [
  { key: 'personal', label: 'Personal Info', number: 1 },
  { key: 'document', label: 'ID Upload', number: 2 },
  { key: 'selfie', label: 'Selfie', number: 3 },
  { key: 'review', label: 'Review', number: 4 },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Spain', 'Italy', 'Netherlands', 'Singapore', 'Japan', 'Nigeria',
];

const DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'residence_permit', label: 'Residence Permit' },
];

export default function KYCWizardPage() {
  const navigate = useNavigate();
  const { data: status, isLoading: _statusLoading } = useKycStatus();
  const submitKyc = useSubmitKyc();

  const [step, setStep] = useState<KycStep>('personal');
  const [error, setError] = useState<string | null>(null);

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState<KycPersonalInfo>({
    fullName: '', dateOfBirth: '', nationality: '', address: '',
    city: '', country: '', postalCode: '', phone: '',
  });

  // Document info
  const [docType, setDocType] = useState<string>('passport');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string>('');
  const [backPreview, setBackPreview] = useState<string>('');

  // Selfie
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>('');
  const [resultStatus, setResultStatus] = useState<'submitted' | 'verified' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileSelect = useCallback((file: File | undefined, type: 'front' | 'back' | 'selfie') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      if (type === 'front') { setFrontFile(file); setFrontPreview(url); }
      else if (type === 'back') { setBackFile(file); setBackPreview(url); }
      else { setSelfieFile(file); setSelfiePreview(url); }
    };
    reader.readAsDataURL(file);
  }, []);

  // Validate personal info step
  const validatePersonal = (): boolean => {
    if (!personalInfo.fullName.trim()) { setError('Full name is required'); return false; }
    if (!personalInfo.dateOfBirth) { setError('Date of birth is required'); return false; }
    if (!personalInfo.country) { setError('Country is required'); return false; }
    if (!personalInfo.address.trim()) { setError('Address is required'); return false; }
    setError(null);
    return true;
  };

  // Validate document step
  const validateDocument = (): boolean => {
    if (!frontFile) { setError('Front of document is required'); return false; }
    if (!docNumber.trim()) { setError('Document number is required'); return false; }
    setError(null);
    return true;
  };

  // Validate selfie step
  const validateSelfie = (): boolean => {
    if (!selfieFile) { setError('Selfie photo is required'); return false; }
    setError(null);
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    setError(null);
    try {
      // In production, upload files first, then submit
      await submitKyc.mutateAsync({
        personalInfo,
        document: {
          type: docType as any,
          frontImage: frontPreview,
          backImage: backPreview || undefined,
          documentNumber: docNumber,
          expiryDate: docExpiry,
        },
        selfie: {
          image: selfiePreview,
        },
      });
      setResultStatus('submitted');
      setEstimatedTime('24-48 hours');
      setStep('submitted');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Submission failed');
    }
  };

  // Go next
  const goNext = () => {
    const stepMap: Record<KycStep, KycStep> = {
      personal: 'document', document: 'selfie', selfie: 'review',
      review: 'submitted', submitted: 'verified', verified: 'verified', rejected: 'rejected',
    };
    const next = stepMap[step];

    if (step === 'personal' && !validatePersonal()) return;
    if (step === 'document' && !validateDocument()) return;
    if (step === 'selfie' && !validateSelfie()) return;

    setStep(next);
    setError(null);
  };

  const goBack = () => {
    const prevMap: Record<KycStep, KycStep> = {
      personal: 'personal', document: 'personal', selfie: 'document',
      review: 'selfie', submitted: 'submitted', verified: 'verified', rejected: 'rejected',
    };
    setStep(prevMap[step]);
    setError(null);
  };

  // If already verified
  if (status?.status === 'verified' && !resultStatus) {
    return <KycVerified result={status} />;
  }

  // If rejected — allow resubmit
  if (status?.status === 'rejected' && !resultStatus) {
    setRejectionReason(status.rejectionReason || '');
    // Show rejected state
  }

  // Result screens
  if (resultStatus === 'submitted' || step === 'submitted') {
    return <KycSubmitted estimatedTime={estimatedTime} onBack={() => navigate('/dashboard')} />;
  }
  if (resultStatus === 'verified') {
    return <KycVerified result={status} />;
  }
  if (resultStatus === 'rejected') {
    return <KycRejected reason={rejectionReason} onRetry={() => { setResultStatus(null); setStep('personal'); }} />;
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
        <p className="text-sm text-white-50 mt-1">Complete your KYC to unlock higher limits</p>
        {rejectionReason && (
          <div className="mt-3 rounded-lg bg-market-red/10 border border-market-red/20 p-3 text-sm text-market-red">
            Previous rejection reason: {rejectionReason}. Please resubmit with correct info.
          </div>
        )}
      </div>

      {/* Steps indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                i === currentStepIndex ? 'bg-gold-500 text-primary-900' :
                i < currentStepIndex ? 'bg-market-green/20 text-market-green' :
                'bg-primary-600 text-white-50',
              )}>
                {i < currentStepIndex ? '✓' : s.number}
              </div>
              <span className={cn(
                'text-xs hidden sm:block',
                i === currentStepIndex ? 'text-gold-500' :
                i < currentStepIndex ? 'text-market-green' : 'text-white-50',
              )}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'h-px w-8 sm:w-16',
                  i < currentStepIndex ? 'bg-market-green/40' : 'bg-primary-500',
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-market-red/10 border border-market-red/20 p-3 text-sm text-market-red">
          {error}
        </div>
      )}

      {/* Step: Personal Info */}
      {step === 'personal' && (
        <div className="rounded-card border border-white-10 bg-primary-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-white-50 mb-1 block">Full Name</label>
              <Input
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Date of Birth</label>
              <Input
                type="date"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Nationality</label>
              <select
                value={personalInfo.nationality}
                onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
                className="w-full rounded-lg border border-primary-500 bg-primary-700 px-3 py-2.5 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              >
                <option value="">Select nationality</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white-50 mb-1 block">Address</label>
              <Input
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">City</label>
              <Input
                value={personalInfo.city}
                onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Postal Code</label>
              <Input
                value={personalInfo.postalCode}
                onChange={(e) => setPersonalInfo({ ...personalInfo, postalCode: e.target.value })}
                placeholder="Postal code"
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Country</label>
              <select
                value={personalInfo.country}
                onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                className="w-full rounded-lg border border-primary-500 bg-primary-700 px-3 py-2.5 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Phone</label>
              <Input
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step: Document Upload */}
      {step === 'document' && (
        <div className="rounded-card border border-white-10 bg-primary-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Upload ID Document</h2>

          <div>
            <label className="text-xs text-white-50 mb-1 block">Document Type</label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  onClick={() => setDocType(dt.value)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                    docType === dt.value
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-primary-500 text-white-50 hover:text-white-70',
                  )}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Front upload */}
          <div>
            <label className="text-xs text-white-50 mb-1 block">Front Side</label>
            <div
              onClick={() => frontInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                frontPreview ? 'border-market-green/40 bg-market-green/5' : 'border-primary-500 hover:border-primary-400',
              )}
            >
              {frontPreview ? (
                <div className="text-center">
                  <img src={frontPreview} alt="Front" className="max-h-32 rounded" />
                  <p className="mt-2 text-xs text-market-green">Uploaded ✓</p>
                </div>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-white-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-white-50">Click to upload front of ID</p>
                  <p className="text-xs text-white-30">JPG, PNG, or PDF</p>
                </>
              )}
            </div>
            <input ref={frontInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0], 'front')} />
          </div>

          {/* Back upload */}
          <div>
            <label className="text-xs text-white-50 mb-1 block">Back Side (optional)</label>
            <div
              onClick={() => backInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                backPreview ? 'border-market-green/40 bg-market-green/5' : 'border-primary-500 hover:border-primary-400',
              )}
            >
              {backPreview ? (
                <div className="text-center">
                  <img src={backPreview} alt="Back" className="max-h-32 rounded" />
                  <p className="mt-2 text-xs text-market-green">Uploaded ✓</p>
                </div>
              ) : (
                <>
                  <svg className="mb-2 h-8 w-8 text-white-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-white-50">Click to upload back of ID</p>
                </>
              )}
            </div>
            <input ref={backInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0], 'back')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white-50 mb-1 block">Document Number</label>
              <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="Document number" />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Expiry Date</label>
              <Input type="date" value={docExpiry} onChange={(e) => setDocExpiry(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={goBack}>Back</Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step: Selfie */}
      {step === 'selfie' && (
        <div className="rounded-card border border-white-10 bg-primary-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Take a Selfie</h2>
          <p className="text-xs text-white-50">Take a clear selfie matching your ID document</p>

          <div
            onClick={() => selfieInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
              selfiePreview ? 'border-market-green/40 bg-market-green/5' : 'border-primary-500 hover:border-primary-400',
            )}
          >
            {selfiePreview ? (
              <div className="text-center">
                <img src={selfiePreview} alt="Selfie" className="mx-auto max-h-48 rounded-lg" />
                <p className="mt-2 text-xs text-market-green">Photo captured ✓</p>
              </div>
            ) : (
              <>
                <svg className="mb-3 h-12 w-12 text-white-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p className="text-sm text-white-50">Click to upload selfie</p>
                <p className="text-xs text-white-30">Clear, well-lit photo</p>
              </>
            )}
          </div>
          <input ref={selfieInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files?.[0], 'selfie')} />

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={goBack}>Back</Button>
            <Button onClick={goNext}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="rounded-card border border-white-10 bg-primary-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Review Your Information</h2>

          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-medium text-white-70 uppercase mb-2">Personal Info</h3>
              <div className="rounded-lg bg-primary-700 p-3 space-y-1.5 text-sm">
                <InfoRow label="Full Name" value={personalInfo.fullName} />
                <InfoRow label="DOB" value={personalInfo.dateOfBirth} />
                <InfoRow label="Nationality" value={personalInfo.nationality} />
                <InfoRow label="Address" value={`${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`} />
                <InfoRow label="Phone" value={personalInfo.phone} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-white-70 uppercase mb-2">Document</h3>
              <div className="rounded-lg bg-primary-700 p-3 space-y-1.5 text-sm">
                <InfoRow label="Type" value={DOCUMENT_TYPES.find(d => d.value === docType)?.label || docType} />
                <InfoRow label="Number" value={docNumber} />
                <InfoRow label="Front" value={frontFile?.name || 'Uploaded'} />
                <InfoRow label="Back" value={backFile?.name || 'Not provided'} />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-warning">
            By submitting, you confirm that all information provided is accurate and matches your official documents.
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="secondary" onClick={goBack}>Back</Button>
            <Button onClick={handleSubmit} loading={submitKyc.isPending}>
              Submit Verification
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Result screens ── */

function KycSubmitted({ estimatedTime, onBack }: { estimatedTime: string; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold-500/20">
        <svg className="h-10 w-10 text-gold-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Application Submitted</h1>
      <p className="mt-2 text-sm text-white-70">Your identity verification is being reviewed.</p>
      <p className="mt-1 text-sm text-white-50">Estimated time: <strong className="text-gold-500">{estimatedTime}</strong></p>
      <p className="mt-6 text-xs text-white-50">You will be notified once the review is complete.</p>
      <Button className="mt-8" onClick={onBack}>Go to Dashboard</Button>
    </div>
  );
}

function KycVerified({ result }: { result: any }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-market-green/20">
        <svg className="h-10 w-10 text-market-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Identity Verified ✓</h1>
      <p className="mt-2 text-sm text-white-70">Your identity has been verified successfully.</p>
      {result?.limits && (
        <div className="mt-6 rounded-card border border-white-10 bg-primary-800 p-4 text-left space-y-2">
          <h3 className="text-sm font-medium text-white-70">Your Limits</h3>
          <div className="grid grid-cols-3 gap-3">
            <LimitBox label="Daily Deposit" value={result.limits.dailyDeposit} />
            <LimitBox label="Daily Withdrawal" value={result.limits.dailyWithdrawal} />
            <LimitBox label="Monthly Volume" value={result.limits.monthlyVolume} />
          </div>
        </div>
      )}
    </div>
  );
}

function KycRejected({ reason, onRetry }: { reason: string; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-market-red/20">
        <svg className="h-10 w-10 text-market-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Verification Rejected</h1>
      {reason && (
        <div className="mt-4 rounded-lg bg-market-red/10 border border-market-red/20 p-3 text-sm text-market-red">
          {reason}
        </div>
      )}
      <p className="mt-4 text-sm text-white-70">
        Your document could not be verified. Please ensure your documents are clear and match your personal information.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button variant="secondary" onClick={() => window.location.href = 'mailto:support@cryptowallet.com'}>
          Contact Support
        </Button>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-white-50">{label}</span>
      <span className="text-white-90 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function LimitBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-primary-600 p-2 text-center">
      <p className="text-[10px] text-white-50">{label}</p>
      <p className="text-xs font-mono text-white-90">{value}</p>
    </div>
  );
}
