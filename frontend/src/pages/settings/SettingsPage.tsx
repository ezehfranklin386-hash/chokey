import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { Button, Input, Toggle, showErrorToast } from '@/shared/ui';
import { useProfile, useUpdateProfile, useChangePassword } from '@/features/settings/useSettings';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences' | 'about';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'about', label: 'About' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-white">Settings</h1>
        <p className="text-sm text-ink-50 dark:text-white-50">Manage your account and preferences</p>
      </div>

      {/* Tabs - scroll horizontally on mobile */}
      <div className="flex overflow-x-auto border-b border-ink-30/20 dark:border-primary-500/40 gap-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.key
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-ink-50 dark:text-white-50 hover:text-ink-70 dark:hover:text-white-70',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && <ProfileSection />}
      {activeTab === 'security' && <SecuritySection />}
      {activeTab === 'notifications' && <NotificationsSection />}
      {activeTab === 'preferences' && <PreferencesSection />}
      {activeTab === 'about' && <AboutSection />}
    </div>
  );
}

/* ── Profile Section ── */

function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setName(profile?.fullName || '');
    setPhone(profile?.phone || '');
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate({ fullName: name, phone }, {
      onSuccess: () => setEditing(false),
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-12 w-full rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20 text-2xl font-bold text-brand-500">
          {profile?.fullName?.charAt(0) || profile?.email?.charAt(0) || '?'}
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink dark:text-white">{profile?.fullName || 'User'}</h2>
          <p className="text-xs text-ink-50 dark:text-white-50">{profile?.email}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-1 text-xs text-brand-500 hover:text-brand-600"
          >
            Change avatar
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
        </div>
      </div>

      <div className="h-px bg-ink-30/20 dark:bg-primary-500/40" />

      {/* Form fields */}
      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Email</label>
          <Input value={profile?.email || ''} readOnly className="text-ink-50 dark:text-white-50" />
          <p className="text-[10px] text-ink-30 dark:text-white-30 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Full Name</label>
          <Input
            value={editing ? name : (profile?.fullName || '')}
            onChange={(e) => setName(e.target.value)}
            readOnly={!editing}
            className={!editing ? 'text-ink-50 dark:text-white-50' : ''}
          />
        </div>
        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Phone</label>
          <Input
            value={editing ? phone : (profile?.phone || '')}
            onChange={(e) => setPhone(e.target.value)}
            readOnly={!editing}
            placeholder="Not set"
            className={!editing ? 'text-ink-50 dark:text-white-50' : ''}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {editing ? (
          <>
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={updateProfile.isPending}>Save Changes</Button>
          </>
        ) : (
          <Button variant="secondary" onClick={startEditing}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
}

/* ── Security Section ── */

function SecuritySection() {
  const changePassword = useChangePassword();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      showErrorToast('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showErrorToast('Password must be at least 8 characters');
      return;
    }
    changePassword.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        setShowPasswordForm(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
    });
  };

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-6">
      {/* 2FA */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink dark:text-white">Two-Factor Authentication</h3>
          <p className="text-xs text-ink-50 dark:text-white-50 mt-0.5">Add an extra layer of security to your account</p>
        </div>
        <Toggle checked={false} onChange={() => {}} />
      </div>

      <div className="h-px bg-ink-30/20 dark:bg-primary-500/40" />

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-medium text-ink dark:text-white">Password</h3>
            <p className="text-xs text-ink-50 dark:text-white-50 mt-0.5">Change your account password</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
            {showPasswordForm ? 'Cancel' : 'Change'}
          </Button>
        </div>

        {showPasswordForm && (
          <div className="space-y-3 max-w-md">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            <Button onClick={handleChangePassword} loading={changePassword.isPending}>
              Update Password
            </Button>
          </div>
        )}
      </div>

      <div className="h-px bg-ink-30/20 dark:bg-primary-500/40" />

      {/* Sessions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink dark:text-white">Active Sessions</h3>
          <p className="text-xs text-ink-50 dark:text-white-50 mt-0.5">Manage your active login sessions</p>
        </div>
        <Button variant="secondary" size="sm">View All</Button>
      </div>

      <div className="h-px bg-ink-30/20 dark:bg-primary-500/40" />

      {/* API Keys */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-ink dark:text-white">API Keys</h3>
          <p className="text-xs text-ink-50 dark:text-white-50 mt-0.5">Create and manage API keys for programmatic trading</p>
        </div>
        <Button variant="secondary" size="sm">Manage</Button>
      </div>
    </div>
  );
}

/* ── Notifications Section ── */

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    priceAlerts: true,
    orderFills: true,
    depositConfirmations: true,
    withdrawalUpdates: true,
    signalNotifications: false,
    marketingEmails: false,
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-6">
      <h2 className="text-sm font-bold text-ink dark:text-white">Notification Preferences</h2>

      {/* Channels */}
      <div>
        <h3 className="text-xs font-medium text-ink-70 dark:text-white-70 uppercase mb-3">Delivery Channels</h3>
        <div className="space-y-3">
          <ToggleRow label="Push Notifications" desc="Receive push notifications in your browser" checked={prefs.pushEnabled} onChange={() => toggle('pushEnabled')} />
          <ToggleRow label="Email Notifications" desc="Receive email notifications" checked={prefs.emailEnabled} onChange={() => toggle('emailEnabled')} />
          <ToggleRow label="SMS Notifications" desc="Receive SMS for critical updates" checked={prefs.smsEnabled} onChange={() => toggle('smsEnabled')} />
        </div>
      </div>

      <div className="h-px bg-ink-30/20 dark:bg-primary-500/40" />

      {/* Events */}
      <div>
        <h3 className="text-xs font-medium text-ink-70 dark:text-white-70 uppercase mb-3">Events</h3>
        <div className="space-y-3">
          <ToggleRow label="Price Alerts" desc="When price targets are hit" checked={prefs.priceAlerts} onChange={() => toggle('priceAlerts')} />
          <ToggleRow label="Order Fills" desc="When your orders are executed" checked={prefs.orderFills} onChange={() => toggle('orderFills')} />
          <ToggleRow label="Deposits" desc="When deposits are confirmed" checked={prefs.depositConfirmations} onChange={() => toggle('depositConfirmations')} />
          <ToggleRow label="Withdrawals" desc="When withdrawal status changes" checked={prefs.withdrawalUpdates} onChange={() => toggle('withdrawalUpdates')} />
          <ToggleRow label="Trading Signals" desc="New signal notifications" checked={prefs.signalNotifications} onChange={() => toggle('signalNotifications')} />
          <ToggleRow label="Marketing" desc="Product updates and promotions" checked={prefs.marketingEmails} onChange={() => toggle('marketingEmails')} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}

/* ── Preferences Section ── */

function PreferencesSection() {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [slippage, setSlippage] = useState('1.0');
  const [defaultView, setDefaultView] = useState('trading');

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-6">
      <h2 className="text-sm font-bold text-ink dark:text-white">Preferences</h2>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Display Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-ink-30/20 dark:border-primary-500 bg-surface-secondary dark:bg-primary-700 px-3 py-2.5 text-sm text-ink dark:text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
            <option value="NGN">NGN (₦)</option>
            <option value="SGD">SGD (S$)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-ink-30/20 dark:border-primary-500 bg-surface-secondary dark:bg-primary-700 px-3 py-2.5 text-sm text-ink dark:text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="zh">Chinese (Simplified)</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Default Slippage Tolerance</label>
          <select
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="w-full rounded-lg border border-ink-30/20 dark:border-primary-500 bg-surface-secondary dark:bg-primary-700 px-3 py-2.5 text-sm text-ink dark:text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="0.5">0.5%</option>
            <option value="1.0">1.0%</option>
            <option value="2.0">2.0%</option>
            <option value="5.0">5.0%</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-ink-50 dark:text-white-50 mb-1 block">Default Trading View</label>
          <div className="flex gap-2">
            {['trading', 'simple', 'advanced'].map((v) => (
              <button
                key={v}
                onClick={() => setDefaultView(v)}
                className={cn(
                  'rounded-lg px-4 py-2 text-xs font-medium border transition-colors',
                  defaultView === v
                    ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                    : 'border-ink-30/20 dark:border-primary-500 text-ink-50 dark:text-white-50 hover:text-ink-70 dark:hover:text-white-70',
                )}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}

/* ── About Section ── */

function AboutSection() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth and redirect
    localStorage.clear();
    navigate('/auth/sign-in', { replace: true });
  };

  return (
    <div className="rounded-card border border-ink-30/10 dark:border-white/10 bg-white dark:bg-primary-800 p-6 space-y-6">
      <h2 className="text-sm font-bold text-ink dark:text-white">About</h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between py-2 border-b border-ink-30/10 dark:border-primary-500/20">
          <span className="text-ink-50 dark:text-white-50">Version</span>
          <span className="text-ink-90 dark:text-white-90 font-mono">1.0.0</span>
        </div>
        <div className="flex justify-between py-2 border-b border-ink-30/10 dark:border-primary-500/20">
          <span className="text-ink-50 dark:text-white-50">Build</span>
          <span className="text-ink-90 dark:text-white-90 font-mono">2026.07.08</span>
        </div>
        <button className="flex w-full justify-between py-2 border-b border-ink-30/10 dark:border-primary-500/20 text-left hover:text-brand-500 transition-colors">
          <span className="text-ink-50 dark:text-white-50">Terms of Service</span>
          <svg className="h-4 w-4 text-ink-30 dark:text-white-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="flex w-full justify-between py-2 border-b border-ink-30/10 dark:border-primary-500/20 text-left hover:text-brand-500 transition-colors">
          <span className="text-ink-50 dark:text-white-50">Privacy Policy</span>
          <svg className="h-4 w-4 text-ink-30 dark:text-white-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button className="flex w-full justify-between py-2 border-b border-ink-30/10 dark:border-primary-500/20 text-left hover:text-brand-500 transition-colors">
          <span className="text-ink-50 dark:text-white-50">Licenses</span>
          <svg className="h-4 w-4 text-ink-30 dark:text-white-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="pt-4">
        <Button variant="danger" onClick={handleLogout} fullWidth>
          Sign Out
        </Button>
      </div>

      <p className="text-center text-[10px] text-ink-30 dark:text-white-30">
        CryptoWallet Pro © 2026. All rights reserved.
      </p>
    </div>
  );
}

/* ── Shared helper components ── */

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink dark:text-white truncate">{label}</p>
        <p className="text-xs text-ink-50 dark:text-white-50 truncate">{desc}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
