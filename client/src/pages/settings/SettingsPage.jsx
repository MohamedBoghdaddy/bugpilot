import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiCog, HiBell, HiShieldCheck, HiColorSwatch, HiArrowLeft, HiCheck } from 'react-icons/hi';

const STORAGE_KEY = 'bugpilot:userSettings';

const defaultSettings = {
  notifyNewBugs: true,
  notifyAssignments: true,
  notifyInApp: true,
  darkMode: false,
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

const Section = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <div className="space-y-1 border-t border-gray-100 pt-4">{children}</div>
  </div>
);

const ReadOnlyRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 px-1">
    <span className="text-sm text-gray-700">{label}</span>
    <span className="text-sm text-gray-500 font-mono">{value || '—'}</span>
  </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2.5 px-1">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 ${
        checked ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </div>
);

const SelectRow = ({ label, value, options, onChange }) => (
  <div className="flex items-center justify-between py-2.5 px-1">
    <span className="text-sm text-gray-700">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const ComingSoonRow = ({ label }) => (
  <div className="flex items-center justify-between py-2.5 px-1">
    <span className="text-sm text-gray-700">{label}</span>
    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Coming soon</span>
  </div>
);

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
];

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Dubai', 'Asia/Riyadh',
  'Asia/Cairo', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney',
];

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  const update = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <HiCheck className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <Section icon={HiCog} title="Account" description="Your account information (read-only)">
        <ReadOnlyRow label="Display name" value={user?.name} />
        <ReadOnlyRow label="Email address" value={user?.email} />
        <ReadOnlyRow label="Role" value={user?.role} />
        <ComingSoonRow label="Change password" />
      </Section>

      <Section icon={HiBell} title="Notifications" description="Control how you receive alerts">
        <ToggleRow
          label="Email notifications for new bugs"
          checked={settings.notifyNewBugs}
          onChange={(v) => update('notifyNewBugs', v)}
        />
        <ToggleRow
          label="Email notifications for assignments"
          checked={settings.notifyAssignments}
          onChange={(v) => update('notifyAssignments', v)}
        />
        <ToggleRow
          label="In-app notifications"
          checked={settings.notifyInApp}
          onChange={(v) => update('notifyInApp', v)}
        />
      </Section>

      <Section icon={HiShieldCheck} title="Security" description="Protect your account">
        <ComingSoonRow label="Two-factor authentication" />
        <ComingSoonRow label="Active sessions" />
        <ComingSoonRow label="Login history" />
      </Section>

      <Section icon={HiColorSwatch} title="Preferences" description="Appearance and display">
        <ToggleRow
          label="Dark mode"
          checked={settings.darkMode}
          onChange={(v) => update('darkMode', v)}
        />
        <SelectRow
          label="Language"
          value={settings.language}
          options={LANGUAGES}
          onChange={(v) => update('language', v)}
        />
        <SelectRow
          label="Timezone"
          value={settings.timezone}
          options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
          onChange={(v) => update('timezone', v)}
        />
      </Section>

      <p className="text-xs text-gray-400 text-center">
        Notification and preference settings are stored locally in your browser.
      </p>
    </div>
  );
};

export default SettingsPage;
