import { useState, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Input, showSuccessToast, showErrorToast } from '@/shared/ui';
import { walletApi } from '@/shared/api/wallet';

interface DepositFlowProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
}

type Step = 'network' | 'address' | 'confirming';

interface DepositNetwork {
  network: string;
  name: string;
  fee: string;
  minConfirmations: number;
  isRecommended: boolean;
}

export function DepositFlow({ assetId, assetName, onClose }: DepositFlowProps) {
  const [step, setStep] = useState<Step>('network');
  const [networks, setNetworks] = useState<DepositNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [memo, setMemo] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load networks on mount
  const loadNetworks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await walletApi.getDepositNetworks(assetId);
      const networks = result as DepositNetwork[];
      setNetworks(networks);
      if (networks.length > 0) {
        const recommended = networks.find((n) => n.isRecommended);
        setSelectedNetwork(recommended?.network || networks[0]!.network);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load networks');
    } finally {
      setIsLoading(false);
    }
  }, [assetId]);

  // Generate address
  const generateAddress = useCallback(async () => {
    if (!selectedNetwork) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await walletApi.getDepositAddress(assetId, selectedNetwork);
      setAddress(result.address);
      setMemo(result.memo);
      setStep('address');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate deposit address');
    } finally {
      setIsLoading(false);
    }
  }, [assetId, selectedNetwork]);

  // Copy to clipboard
  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      showSuccessToast('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showErrorToast('Failed to copy');
    }
  }, [address]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-modal border border-white-10 bg-primary-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Deposit {assetName}</h2>
          <button onClick={onClose} className="text-white-50 hover:text-white-90 transition-colors" aria-label="Close">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {(['network', 'address', 'confirming'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                step === s ? 'bg-gold-500 text-primary-900' :
                networks.indexOf as any ? 'bg-market-green/20 text-market-green' : 'bg-primary-600 text-white-50',
              )}>
                {i + 1}
              </div>
              <span className={cn(
                'text-xs',
                step === s ? 'text-white' : 'text-white-50',
              )}>
                {s === 'network' ? 'Network' : s === 'address' ? 'Address' : 'Confirming'}
              </span>
              {i < 2 && <div className="h-px w-6 bg-primary-500" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-market-red/10 border border-market-red/20 p-3 text-sm text-market-red">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {/* Step: Select Network */}
        {step === 'network' && (
          <div className="space-y-4">
            {!isLoading && networks.length === 0 && (
              <button
                onClick={loadNetworks}
                className="w-full rounded-lg border border-dashed border-primary-500 py-8 text-sm text-white-50 hover:border-gold-500/50 hover:text-gold-500 transition-colors"
              >
                Load available networks
              </button>
            )}

            {networks.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-white-70">Select Network</label>
                {networks.map((net) => (
                  <button
                    key={net.network}
                    onClick={() => setSelectedNetwork(net.network)}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                      selectedNetwork === net.network
                        ? 'border-gold-500 bg-gold-500/5 text-white'
                        : 'border-primary-500 text-white-70 hover:border-primary-400',
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium">{net.name}</p>
                      <p className="text-xs text-white-50">Fee: {net.fee}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white-50">{net.minConfirmations} confirmations</p>
                      {net.isRecommended && (
                        <span className="text-[10px] text-market-green">Recommended</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
              </div>
            )}

            {networks.length > 0 && (
              <Button fullWidth onClick={generateAddress} loading={isLoading}>
                Generate Address
              </Button>
            )}
          </div>
        )}

        {/* Step: Deposit Address */}
        {step === 'address' && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="h-40 w-40 rounded-xl bg-white p-2">
                <div className="flex h-full w-full items-center justify-center bg-primary-800 rounded-lg">
                  <span className="text-6xl text-white-20 font-mono">◈</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-white-50 mb-1 block">Deposit Address</label>
              <div className="flex gap-2">
                <Input
                  value={address}
                  readOnly
                  className="flex-1 font-mono text-xs"
                />
                <Button variant="secondary" onClick={copyAddress} className="shrink-0">
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {memo && (
              <div>
                <label className="text-xs text-white-50 mb-1 block">Memo / Tag (Required)</label>
                <Input value={memo} readOnly className="font-mono text-xs" />
              </div>
            )}

            {/* Warnings */}
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-xs text-warning space-y-1">
              <p>⚠️ Send only <strong>{assetName}</strong> to this address. Sending other tokens may result in permanent loss.</p>
              <p>⚠️ Ensure the network matches <strong>{networks.find(n => n.network === selectedNetwork)?.name || selectedNetwork}</strong>.</p>
              <p>⚠️ Minimum deposit: {networks.find(n => n.network === selectedNetwork)?.minConfirmations || '10'} confirmations required.</p>
            </div>

            <Button fullWidth variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
