import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Deposit',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
          <polyline points="5 5 19 5" />
        </svg>
      ),
      onClick: () => navigate('/wallet'),
      variant: 'gold' as const,
    },
    {
      label: 'Withdraw',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
          <polyline points="19 19 5 19" />
        </svg>
      ),
      onClick: () => navigate('/wallet'),
      variant: 'secondary' as const,
    },
    {
      label: 'Trade',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
      ),
      onClick: () => navigate('/trade'),
      variant: 'secondary' as const,
    },
    {
      label: 'Buy Crypto',
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      onClick: () => navigate('/trade'),
      variant: 'gold' as const,
    },
  ];

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white-10 bg-white dark:bg-primary-800 p-6">
      <h3 className="mb-4 text-sm font-medium text-ink-70 dark:text-white-70">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-all duration-200 ${
              action.variant === 'gold'
                ? 'bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 border border-brand-500/20'
                : 'bg-primary-700 text-ink-70 dark:text-white-70 hover:bg-primary-600 hover:text-ink-90 dark:hover:text-white-90 border border-primary-500'
            }`}
          >
            {action.icon}
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
