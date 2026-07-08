import { useState, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Input, showSuccessToast } from '@/shared/ui';
import { walletApi } from '@/shared/api/wallet';

interface WithdrawFlowProps {
  assetId: string;
  assetName: string;
  availableBalance: string;
  onClose: () => void;
}

type Step = 'address' | 'amount' | 'confirm' | 'verifying';

export function WithdrawFlow({ assetId, assetName, availableBalance, onClose }: WithdrawFlowProps) {
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [networks, setNetworks] = useState<Array<{ network: string; name: string; fee: string; minWithdraw: string; maxWithdraw: string }>>([]);
  const [amount, setAmount] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [fee, _setFee] = useState('0');
  const [receiving, _setReceiving] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNetworks = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await walletApi.getDepositNetworks(assetId);
      setNetworks(result.map((n) => ({
        network: n.network,
        name: n.name,
        fee: n.fee,
        minWithdraw: '0',
        maxWithdraw: '999999',
      })));
      if (result.length > 0) setNetwork(result[0]!.network);
    } catch {
      // Continue with defaults
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  // Go to amount step
  const proceedToAmount = async () => {
    if (!address.trim()) {
      setError('Please enter a withdrawal address');
      return;
    }
    setError(null);
    if (networks.length === 0) {
      await loadNetworks();
    }
    setStep('amount');
  };

  // Proceed to confirm
  const proceedToConfirm = () => {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const availNum = parseFloat(availableBalance.replace(/,/g, ''));
    if (Number(amount) > availNum) {
      setError('Insufficient balance');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  // Submit withdrawal
  const submitWithdraw = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await walletApi.withdraw({
        assetId,
        address: address.trim(),
        amount,
        network,
        twoFactorCode: twoFactorCode || undefined,
      });
      showSuccessToast('Withdrawal request submitted');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const STEPS: Step[] = ['address', 'amount', 'confirm', 'verifying'];
  const STEP_INDEX = STEPS.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-modal border border-white-10 bg-primary-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Withdraw {assetName}</h2>
          <button onClick={onClose} className="text-white-50 hover:text-white-90 transition-colors" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                i === STEP_INDEX ? 'bg-gold-500 text-primary-900' :
                i < STEP_INDEX ? 'bg-market-green/20 text-market-green' : 'bg-primary-600 text-white-50',
              )}>
                {i + 1}
              </div>
              <span className={cn('text-xs', i === STEP_INDEX ? 'text-white' : 'text-white-50')}>
                {s === 'address' ? 'Address' : s === 'amount' ? 'Amount' : 'Confirm'}
              </span>
              {i < 2 && <div className="h-px w-6 bg-primary-500" />}
            </div>
          ))}
        </div>

        {/* Available balance */}
        <div className="text-center mb-4">
          <p className="text-xs text-white-50">Available Balance</p>
          <p className="text-lg font-mono text-white">{availableBalance} {assetName}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-market-red/10 border border-market-red/20 p-3 text-sm text-market-red">
            {error}
          </div>
        )}

        {/* Step 1: Address */}
        {step === 'address' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white-50 mb-1 block">Withdrawal Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${assetName} address`}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-white-50 mb-1 block">Network</label>
              <Input
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="e.g. BTC, ERC20, SOL"
                className="text-sm"
              />
            </div>
            <Button fullWidth onClick={proceedToAmount}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 'amount' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white-50 mb-1 block">Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-2xl font-mono pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white-50">
                  {assetName}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-white-50">
                  ~${amount ? (Number(amount) * 1).toLocaleString() : '0.00'}
                </span>
                <button
                  onClick={() => setAmount(availableBalance.replace(/,/g, ''))}
                  className="text-xs text-gold-500 hover:text-gold-400"
                >
                  Max: {availableBalance}
                </button>
              </div>
            </div>

            <div className="rounded-lg bg-primary-700 p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-white-50">Network Fee</span>
                <span className="text-white">{fee} {assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-50">You Will Receive</span>
                <span className="text-white font-mono">{receiving || amount} {assetName}</span>
              </div>
            </div>

            <Button fullWidth onClick={proceedToConfirm}>
              Review Withdrawal
            </Button>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="rounded-lg bg-primary-700 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white-50">Asset</span>
                <span className="text-white">{assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-50">Network</span>
                <span className="text-white">{network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-50">Address</span>
                <span className="text-white font-mono text-xs max-w-[60%] text-right break-all">{address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-50">Amount</span>
                <span className="text-white font-mono">{amount} {assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white-50">Fee</span>
                <span className="text-white">{fee} {assetName}</span>
              </div>
              <div className="flex justify-between border-t border-primary-500/40 pt-2">
                <span className="text-white">Total</span>
                <span className="text-white font-mono font-bold">
                  {(Number(amount) + Number(fee)).toFixed(8)} {assetName}
                </span>
              </div>
            </div>

            {/* 2FA input */}
            <div>
              <label className="text-xs text-white-50 mb-1 block">2FA Code (if enabled)</label>
              <Input
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg font-mono tracking-widest"
              />
            </div>

            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-warning">
              ⚠️ Please double-check the withdrawal address. This action cannot be reversed.
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('amount')} className="flex-1">
                Back
              </Button>
              <Button onClick={submitWithdraw} loading={isLoading} className="flex-1">
                Confirm Withdraw
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
