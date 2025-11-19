'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, User, CreditCard, Bell, Shield } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [notifications, setNotifications] = useState({
    videoCompleted: true,
    weeklyReport: false,
    marketingEmails: false
  })

  useEffect(() => {
    // TODO: Fetch user data
    setProfile({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    })
    setLoading(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    // TODO: Save settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    alert('Settings saved successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Link href="/dashboard/settings/branding">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <User className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">Branding</h3>
                <p className="text-xs text-gray-600">Customize videos</p>
              </div>
            </Link>
            <Link href="/dashboard/settings/billing">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CreditCard className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">Billing</h3>
                <p className="text-xs text-gray-600">Plans & invoices</p>
              </div>
            </Link>
            <Link href="/dashboard/settings/integrations">
              <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold">Integrations</h3>
                <p className="text-xs text-gray-600">Connect LMS</p>
              </div>
            </Link>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <Bell className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-xs text-gray-600">Email preferences</p>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email managed by authentication provider
                </p>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                {
                  key: 'videoCompleted',
                  label: 'Video Completed',
                  description: 'Get notified when your video is ready'
                },
                {
                  key: 'weeklyReport',
                  label: 'Weekly Report',
                  description: 'Receive a weekly summary of your activity'
                },
                {
                  key: 'marketingEmails',
                  label: 'Marketing Emails',
                  description: 'Tips, updates, and special offers'
                }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{label}</h4>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications[key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notifications[key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm p-8 border-2 border-red-200">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
