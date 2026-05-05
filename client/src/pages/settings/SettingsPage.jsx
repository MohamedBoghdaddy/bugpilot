import React from 'react';
import { HiCog, HiBell, HiShieldCheck, HiColorSwatch } from 'react-icons/hi';

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

const ComingSoonRow = ({ label }) => (
  <div className="flex items-center justify-between py-2.5 px-1">
    <span className="text-sm text-gray-700">{label}</span>
    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Coming soon</span>
  </div>
);

const SettingsPage = () => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
    </div>

    <Section
      icon={HiCog}
      title="Account"
      description="Personal account settings"
    >
      <ComingSoonRow label="Change display name" />
      <ComingSoonRow label="Change email address" />
      <ComingSoonRow label="Change password" />
    </Section>

    <Section
      icon={HiBell}
      title="Notifications"
      description="Control how you receive alerts"
    >
      <ComingSoonRow label="Email notifications for new bugs" />
      <ComingSoonRow label="Email notifications for assignments" />
      <ComingSoonRow label="In-app notifications" />
    </Section>

    <Section
      icon={HiShieldCheck}
      title="Security"
      description="Protect your account"
    >
      <ComingSoonRow label="Two-factor authentication" />
      <ComingSoonRow label="Active sessions" />
      <ComingSoonRow label="Login history" />
    </Section>

    <Section
      icon={HiColorSwatch}
      title="Preferences"
      description="Appearance and display"
    >
      <ComingSoonRow label="Dark mode" />
      <ComingSoonRow label="Language" />
      <ComingSoonRow label="Timezone" />
    </Section>
  </div>
);

export default SettingsPage;
