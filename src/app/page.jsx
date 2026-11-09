'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CircleDollarSign,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  Lock,
  Menu,
  X,
  RotateCcw,
  BadgeCheck,
  Building,
  HeartHandshake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Calculator State
  const [contributionNaira, setContributionNaira] = useState(25000)
  const [memberCount, setMemberCount] = useState(10)
  const [frequency, setFrequency] = useState('monthly')

  // Interactive FAQ State
  const [openFaq, setOpenFaq] = useState(0)

  // Calculations for calculator
  const totalPoolNaira = contributionNaira * memberCount
  const cycleDuration = `${memberCount} ${frequency === 'monthly' ? 'Months' : frequency === 'weekly' ? 'Weeks' : 'Days'}`

  const faqs = [
    {
      q: 'Does AdashiCircle take custody or hold my group’s money?',
      a: 'No. For our MVP release, AdashiCircle acts as an intelligent digital recordkeeper and reconciliation system. Group members pay directly to the agreed group account or rotational recipient, while our platform tracks expected amounts, records verified payment proofs, manages schedules, and provides mathematical transparency.',
    },
    {
      q: 'How does rotational payout scheduling work?',
      a: 'When an administrator sets up a circle, they configure the payout order (positions #1, #2, #3, etc.) either by lottery, agreement, or first-come priority. Each cycle automatically assigns the designated recipient their expected lump-sum pool.',
    },
    {
      q: 'Can members upload proof of payment?',
      a: 'Yes! Members can submit bank transfer transaction references or upload payment receipts. Group administrators review and approve these submissions with a single click, immediately updating the circle’s live ledger.',
    },
    {
      q: 'What happens if a member is late with their contribution?',
      a: 'AdashiCircle allows group admins to set customized rules, including grace periods (e.g. 3 days) and optional late penalties. Automated in-app and email reminders are sent to prevent members from forgetting.',
    },
    {
      q: 'Can I export financial records for disputes or accounting?',
      a: 'Absolutely. Administrators and members can export comprehensive contribution ledgers, rotational payout records, and individual statements in both CSV and formatted PDF formats at any time.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ================================================================
          1. NAVIGATION BAR
      ================================================================ */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <CircleDollarSign className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Adashi<span className="text-emerald-600">Circle</span>
              </span>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 -mt-1 tracking-wider uppercase">
                Digital Cooperative Savings
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 transition-colors">
              Features
            </a>
            <a href="#calculator" className="hover:text-emerald-600 transition-colors">
              Payout Calculator
            </a>
            <a href="#comparison" className="hover:text-emerald-600 transition-colors">
              Why Not WhatsApp?
            </a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium text-sm text-slate-700 dark:text-slate-200 hover:text-emerald-600">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 shadow-sm shadow-emerald-600/30">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              Features
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              Payout Calculator
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              Why Not WhatsApp?
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ================================================================
          2. HERO SECTION WITH CLEAN PRODUCT MOCKUP
      ================================================================ */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle background ambient tint */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Modernizing Nigerian Adashi, Ajo & Esusu</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Save Together.{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Grow Together.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Replace manual notebooks, lost WhatsApp spreadsheets, and verbal promises with a centralized, verified digital platform. Automate contributions, rotation positions, and payout scheduling with 100% transparency.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 shadow-md">
                    Start Your Savings Circle
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#calculator" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full h-12 px-6 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                    Calculate Payout Pool
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>Integer Kobo Precision</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Row-Level Security (RLS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Tamper-Proof Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Right Live Interactive Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Static Notification Badge */}
                <div className="absolute -top-5 -left-4 z-20 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Payment Confirmed</p>
                    <p className="text-[10px] text-slate-500">Amina B. paid ₦50,000 for Cycle #4</p>
                  </div>
                </div>

                {/* Static Next Payout Badge */}
                <div className="absolute -bottom-6 -right-3 z-20 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Next Rotational Payout</p>
                    <p className="text-[10px] text-emerald-600 font-bold">₦500,000 to Position #4</p>
                  </div>
                </div>

                {/* Main Card UI Preview */}
                <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow">
                        LC
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lagos Corporate Ajo</h4>
                        <p className="text-xs text-slate-500">10 Members · Monthly Rotation</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                      Active Cycle #4
                    </span>
                  </div>

                  {/* Pool Value Display */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Pool Collection</p>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">₦500,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Contribution per Member</p>
                      <p className="text-sm font-bold text-emerald-600">₦50,000 / month</p>
                    </div>
                  </div>

                  {/* Rotation Order Preview List */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rotational Payout Queue</p>
                    
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Tunde Adeyemi</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">Paid Jan</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Fatima Ibrahim</span>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">Paid Feb</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-300">Emeka Okafor (Next Recipient)</span>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">Due in 4 Days</span>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-slate-400">All data automatically audited and time-stamped in PostgreSQL</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          3. INTERACTIVE SAVINGS & PAYOUT CALCULATOR
      ================================================================ */}
      <section id="calculator" className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Interactive Tool</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Calculate Your Group’s Rotational Payout
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              See exactly how much each member collects and how rotational saving multiplies your purchasing power.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="contribution-slider" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Contribution Amount per Member
                    </label>
                    <span className="text-base font-extrabold text-emerald-600">
                      ₦{contributionNaira.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="contribution-slider"
                    type="range"
                    min="5000"
                    max="200000"
                    step="5000"
                    value={contributionNaira}
                    onChange={(e) => setContributionNaira(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>₦5,000</span>
                    <span>₦50,000</span>
                    <span>₦100,000</span>
                    <span>₦200,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="members-slider" className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Number of Group Members
                    </label>
                    <span className="text-base font-extrabold text-emerald-600">
                      {memberCount} Members
                    </span>
                  </div>
                  <input
                    id="members-slider"
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>3 people</span>
                    <span>10 people</span>
                    <span>20 people</span>
                    <span>30 people</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">
                    Contribution Frequency
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['monthly', 'weekly', 'daily'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition-all ${
                          frequency === f
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Calculated Output Card */}
              <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    Expected Rotational Payout
                  </span>
                  <div>
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                      ₦{totalPoolNaira.toLocaleString()}
                    </span>
                    <p className="text-xs text-emerald-200 mt-1">
                      Lump sum received by each member on their rotation turn.
                    </p>
                  </div>

                  <div className="border-t border-emerald-700/60 pt-4 space-y-2 text-xs text-emerald-100">
                    <div className="flex justify-between">
                      <span>Total Savings Cycle Duration:</span>
                      <span className="font-bold text-white">{cycleDuration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Individual Total Invested:</span>
                      <span className="font-bold text-white">₦{totalPoolNaira.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Zero Hidden Deductions:</span>
                      <span className="font-bold text-emerald-300">100% Retained</span>
                    </div>
                  </div>

                  <Link href="/register" className="block pt-2">
                    <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-3 shadow">
                      Start This Circle Free
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          4. COMPARISON: TRADITIONAL / WHATSAPP VS ADASHICIRCLE
      ================================================================ */}
      <section id="comparison" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Comparison</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why Savings Groups Leave WhatsApp for AdashiCircle
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              WhatsApp and notebooks were never designed for financial accountability. Here is how AdashiCircle solves informal savings headaches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Frustrating Way */}
            <div className="rounded-3xl border border-red-200/80 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center font-bold">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Informal Groups (WhatsApp & Notebooks)</h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Prone to human error, disputes & tension</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Endless payment arguments:</strong> Screenshots get buried in group chats with no single source of truth.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Organizer burnout:</strong> Admins spend hours every week chasing members and manually updating notebooks.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Disorganized payout dates:</strong> Rotation orders get changed verbally without collective consensus.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Zero credit or savings history:</strong> You save millions with your group but have no verifiable statement to show a bank.</span>
                </li>
              </ul>
            </div>

            {/* The AdashiCircle Modern Way */}
            <div className="rounded-3xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">With AdashiCircle</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Organized, verified, and automated</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verifiable Payment Receipts:</strong> Members submit references/evidence, and admins approve them into an immutable ledger.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Automated Deadline Reminders:</strong> Real-time in-app and email notifications remove the awkwardness of chasing friends.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Locked Payout Schedules:</strong> Assigned rotational positions are transparent to every member before the cycle begins.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Downloadable Financial Statements:</strong> Export branded PDF certificates and CSV records of your completed contributions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          5. CORE THREE SAVINGS MODELS (SUPPORTED USE CASES)
      ================================================================ */}
      <section id="features" className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Savings Models</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Every Type of Cooperative Group
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Whether you are running traditional rotational Ajo or saving towards a group asset, AdashiCircle adapts to your model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. Rotational Savings (Ajo / Esusu)</h3>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Traditional ROSCA Model</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Members contribute a fixed amount each cycle. The pooled funds are distributed to one member per rotation based on agreed positions.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• Automated cycle generation</li>
                <li>• Pre-assigned position queue</li>
                <li>• Instant payout receipt records</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Target Goal Savings</h3>
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Shared or Individual Milestone</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Members contribute regularly toward a shared milestone (e.g. end-of-year bulk purchases, land purchase, or family celebrations).
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• Target progress indicators</li>
                <li>• Milestone contribution tracking</li>
                <li>• Transparent collective balance</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-4 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Fixed-Term Cooperative</h3>
              <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Workplace & Society Cooperatives</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Organized staff associations and community societies that save over a fixed period (e.g. 12 months) before collective distribution.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li>• Monthly contribution summaries</li>
                <li>• Late payment grace period controls</li>
                <li>• PDF financial statements</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          6. INTERACTIVE FAQ ACCORDION
      ================================================================ */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Everything you need to know about setting up and running your circle on AdashiCircle.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-sm sm:text-base"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          7. BOTTOM CALL TO ACTION
      ================================================================ */}
      <section className="py-20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/20">
            <HeartHandshake className="w-3.5 h-3.5" />
            100% Free for circles up to 10 members
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Modernize Your Savings Group?
          </h2>
          <p className="text-emerald-100 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Join families, colleagues, and community groups saving smarter and growing together across Nigeria.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-8 h-12 shadow-xl">
                Create Your Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 h-12 px-8">
                Already in a group? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          8. FOOTER
      ================================================================ */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">AdashiCircle</span>
            <span>· Save Together. Grow Together.</span>
          </div>

          <p>
            &copy; {new Date().getFullYear()} AdashiCircle Technologies. Built for Nigerian Cooperative Groups.
          </p>
        </div>
      </footer>
    </div>
  )
}
