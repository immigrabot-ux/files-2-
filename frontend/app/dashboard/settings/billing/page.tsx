'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, Zap, CreditCard, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '5 videos per month',
      '20 slides max',
      '720p resolution',
      '2GB storage',
      'Story Mode',
      'Watermark included'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    popular: true,
    features: [
      '50 videos per month',
      '100 slides max',
      '1080p resolution',
      '50GB storage',
      'Story Mode',
      'No watermark',
      'Custom branding',
      'Priority support'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    price: 79,
    features: [
      '200 videos per month',
      'Unlimited slides',
      '4K resolution',
      '200GB storage',
      'Story Mode',
      'No watermark',
      'Custom branding',
      'Team access (5 seats)',
      'LMS integrations',
      'Priority support',
      'API access'
    ]
  }
]

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState('free')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    // TODO: Fetch current plan and invoices
    setInvoices([
      {
        id: 'inv_001',
        date: '2025-11-01',
        amount: 29,
        status: 'paid',
        pdfUrl: '#'
      }
    ])
  }, [])

  const handleUpgrade = (planId: string) => {
    // TODO: Integrate with Stripe
    alert(`Upgrading to ${planId} plan...`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Billing & Plans</h1>
            <p className="text-gray-600">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all",
                  billingCycle === 'monthly'
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-6 py-2 rounded-lg transition-all",
                  billingCycle === 'yearly'
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Yearly <span className="text-green-500 text-xs ml-1">(Save 20%)</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PLANS.map(plan => {
              const isCurrentPlan = currentPlan === plan.id
              const price = billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "bg-white rounded-lg shadow-sm p-8 relative",
                    plan.popular && "border-2 border-primary"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-gray-600">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <CreditCard className="w-10 h-10 text-gray-400" />
                <div>
                  <p className="font-semibold">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            <Button variant="outline" size="sm">
              Add Payment Method
            </Button>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-6">Billing History</h2>
            {invoices.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No invoices yet</p>
            ) : (
              <div className="divide-y">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Invoice #{invoice.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">${invoice.amount}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        invoice.status === 'paid'
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}>
                        {invoice.status}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={invoice.pdfUrl} download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
