import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Crown,
  KeyRound,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { BrandLogo } from '@/components/shared/BrandLogo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuth, PRESET_USERS, UserRole } from '@/data/authContext'
import { useToast } from '@/hooks/useToast'

export const LoginPage: React.FC = () => {
  const { login, loginAs, currentUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    setTimeout(() => {
      const res = login(email, password)
      setIsLoading(false)
      if (res.success) {
        addToast({
          title: 'Authentication Successful',
          description: `Welcome to Zarima Operations.`,
          type: 'success',
        })
        navigate(redirectTarget)
      } else {
        setErrorMessage(res.error || 'Invalid email or password.')
      }
    }, 300)
  }

  const handleQuickLogin = (role: UserRole) => {
    loginAs(role)
    const user = PRESET_USERS[role]
    addToast({
      title: `Signed in as ${user.name}`,
      description: `Active role: ${role === 'admin' ? 'Administrator' : 'Accountant'}.`,
      type: 'success',
    })
    navigate(redirectTarget)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-[#22C55E] selection:text-[#060B08] font-sans transition-colors duration-200">
      
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="border-b border-[#D2EBDA] dark:border-[#1A3323] bg-surface/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <BrandLogo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl hover:bg-surface-elevated"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTAINER */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col items-center justify-center relative">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#22C55E]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Clean Corporate Login Card */}
        <div className="w-full rounded-3xl p-7 sm:p-8 bg-white/95 dark:bg-[#0E1712]/95 border border-[#D2EBDA] dark:border-[#1A3323] shadow-card space-y-6 relative z-10">
          
          {/* Card Header & Brand Emblem */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#060B08] border-2 border-[#22C55E]/40 p-1 shadow-md flex items-center justify-center">
              <img
                src="/images/zarima_logo.jpg"
                alt="Zarima Emblem"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              Staff Portal Sign In
            </h1>
            <p className="text-xs text-muted-foreground">
              Zarima Trading &amp; Logistics PLC internal operations
            </p>
          </div>

          {/* Quick 1-Click Role Login Selector */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-muted-foreground text-center">
              Select User to Sign In
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('accountant')}
                className="p-2.5 rounded-2xl bg-[#22C55E]/10 hover:bg-[#22C55E]/20 border border-[#22C55E]/30 text-foreground transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#22C55E] text-[#060B08] flex items-center justify-center font-black text-xs flex-shrink-0">
                  BT
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">Bethlehem T.</div>
                  <div className="text-[10px] text-[#16A34A] dark:text-[#22C55E] font-semibold truncate">
                    Accountant
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-2xl bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-foreground transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center font-black text-xs flex-shrink-0">
                  DT
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">Dawit T.</div>
                  <div className="text-[10px] text-[#FF6B00] font-semibold truncate">
                    Administrator
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-surface px-2.5 text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              or enter credentials
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Standard Email & Password Form */}
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="name@zarima-trading.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:border-[#22C55E] text-xs text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border focus:outline-none focus:border-[#22C55E] text-xs text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#060B08] font-black text-xs shadow-subtle hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Return to Public Website</span>
            </Link>
          </div>

        </div>

      </main>

      {/* ------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#D2EBDA] dark:border-[#1A3323] py-5 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Zarima Trading &amp; Logistics PLC. All Rights Reserved.</p>
          <div className="text-[11px] text-muted-foreground">
            Central Inventory: Kality Industrial Zone, Addis Ababa
          </div>
        </div>
      </footer>

    </div>
  )
}
