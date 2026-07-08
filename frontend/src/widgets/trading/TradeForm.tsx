import { useState, useCallback } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button, Input, showErrorToast } from '@/shared/ui';
import { usePlaceOrder } from '@/features/trading/useTrading';

interface TradeFormProps {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice?: string;
  balance?: string;
}

type OrderSide = 'buy' | 'sell';
type OrderType = 'market' | 'limit';

const QUICK_PERCENTS = [25, 50, 75, 100];

export function TradeForm({ symbol, baseAsset, quoteAsset, lastPrice, balance }: TradeFormProps) {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [price, setPrice] = useState(lastPrice || '');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');

  const placeOrder = usePlaceOrder();

  // Update price when lastPrice changes
  if (lastPrice && price !== lastPrice && orderType === 'market') {
    // Don't auto-update — user might have set something
  }

  // Calculate total from amount × price
  const updateTotalFromAmount = useCallback((amt: string) => {
    if (orderType === 'market') {
      setTotal(amt);
    } else {
      const p = parseFloat(price);
      const a = parseFloat(amt);
      if (p && a) setTotal((p * a).toFixed(2));
    }
  }, [orderType, price]);

  // Calculate amount from total / price
  const updateAmountFromTotal = useCallback((tot: string) => {
    if (orderType === 'market') {
      setAmount(tot);
    } else {
      const p = parseFloat(price);
      const t = parseFloat(tot);
      if (p && t) setAmount((t / p).toFixed(8));
    }
  }, [orderType, price]);

  // Quick amount
  const handleQuickAmount = useCallback((percent: number) => {
    if (!balance) return;
    const b = parseFloat(balance.replace(/,/g, ''));
    if (side === 'buy') {
      const tot = (b * percent / 100).toFixed(2);
      setTotal(tot);
      updateAmountFromTotal(tot);
    } else {
      const amt = (b * percent / 100).toFixed(8);
      setAmount(amt);
      updateTotalFromAmount(amt);
    }
  }, [balance, side, updateAmountFromTotal, updateTotalFromAmount]);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showErrorToast('Please enter an amount');
      return;
    }
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      showErrorToast('Please enter a limit price');
      return;
    }

    placeOrder.mutate({
      symbol,
      side,
      type: orderType,
      price: orderType === 'limit' ? price : undefined,
      quantity: amount,
      timeInForce: orderType === 'limit' ? timeInForce : undefined,
    });
  };

  const isBuy = side === 'buy';
  const availAmount = balance ? `${parseFloat(balance).toFixed(isBuy ? 2 : 8)}` : '—';

  return (
    <div className="rounded-card border border-white-10 bg-primary-800">
      {/* Buy/Sell Toggle */}
      <div className="flex border-b border-primary-500/40">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors',
            isBuy
              ? 'text-market-green border-b-2 border-market-green bg-market-green/5'
              : 'text-white-50 hover:text-white-70',
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-colors',
            !isBuy
              ? 'text-market-red border-b-2 border-market-red bg-market-red/5'
              : 'text-white-50 hover:text-white-70',
          )}
        >
          Sell
        </button>
      </div>

      {/* Market/Limit Toggle */}
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {(['market', 'limit'] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={cn(
              'rounded px-3 py-1 text-xs font-medium transition-colors',
              orderType === t
                ? 'bg-primary-500 text-white'
                : 'text-white-50 hover:text-white-70',
            )}
          >
            {t === 'market' ? 'Market' : 'Limit'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {/* Balance line */}
        <div className="flex justify-between text-xs">
          <span className="text-white-50">Available</span>
          <span className="text-white font-mono">{availAmount} {isBuy ? quoteAsset : baseAsset}</span>
        </div>

        {/* Limit Price */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-white-50 mb-1 block">Price</label>
            <div className="relative">
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={lastPrice || '0.00'}
                className="pr-14 text-sm font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-50">{quoteAsset}</span>
            </div>
            {lastPrice && (
              <button
                onClick={() => setPrice(lastPrice)}
                className="mt-1 text-[10px] text-gold-500 hover:text-gold-400"
              >
                Last Price: {lastPrice}
              </button>
            )}
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-xs text-white-50 mb-1 block">
            {isBuy ? 'Total' : 'Amount'}
          </label>
          <div className="relative">
            <Input
              type="number"
              value={isBuy && orderType === 'market' ? total : amount}
              onChange={(e) => {
                const val = e.target.value;
                if (isBuy && orderType === 'market') {
                  setTotal(val);
                  updateAmountFromTotal(val);
                } else {
                  setAmount(val);
                  updateTotalFromAmount(val);
                }
              }}
              placeholder="0.00"
              className="pr-14 text-sm font-mono"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-50">
              {isBuy && orderType === 'market' ? quoteAsset : baseAsset}
            </span>
          </div>
        </div>

        {/* Limit: Amount field */}
        {orderType === 'limit' && (
          <div>
            <label className="text-xs text-white-50 mb-1 block">Total</label>
            <div className="relative">
              <Input
                type="number"
                value={total}
                onChange={(e) => {
                  const val = e.target.value;
                  setTotal(val);
                  updateAmountFromTotal(val);
                }}
                placeholder="0.00"
                className="pr-14 text-sm font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-50">{quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Market: Amount field (for display) */}
        {isBuy && orderType === 'market' && (
          <div>
            <label className="text-xs text-white-50 mb-1 block">Est. Received</label>
            <div className="relative">
              <Input
                type="number"
                value={amount}
                readOnly
                className="pr-14 text-sm font-mono text-white-70"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white-50">{baseAsset}</span>
            </div>
          </div>
        )}

        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {QUICK_PERCENTS.map((pct) => (
            <button
              key={pct}
              onClick={() => handleQuickAmount(pct)}
              className={cn(
                'flex-1 rounded py-1.5 text-xs font-medium transition-colors',
                isBuy
                  ? 'bg-market-green/10 text-market-green hover:bg-market-green/20'
                  : 'bg-market-red/10 text-market-red hover:bg-market-red/20',
              )}
            >
              {pct}%
            </button>
          ))}
        </div>

        {/* Time In Force (limit only) */}
        {orderType === 'limit' && (
          <div className="flex gap-1">
            {(['GTC', 'IOC', 'FOK'] as const).map((tif) => (
              <button
                key={tif}
                onClick={() => setTimeInForce(tif)}
                className={cn(
                  'flex-1 rounded py-1 text-[10px] font-medium transition-colors',
                  timeInForce === tif
                    ? 'bg-gold-500/10 text-gold-500 border border-gold-500/30'
                    : 'text-white-50 bg-primary-600 hover:bg-primary-500',
                )}
              >
                {tif}
              </button>
            ))}
          </div>
        )}

        {/* Submit */}
        <Button
          fullWidth
          variant={isBuy ? 'primary' : 'danger'}
          onClick={handleSubmit}
          loading={placeOrder.isPending}
        >
          {isBuy ? `Buy ${baseAsset}` : `Sell ${baseAsset}`}
        </Button>
      </div>
    </div>
  );
}
