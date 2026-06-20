import Link from 'next/link'

const FEATURES = [
  {
    icon: '🧬',
    title: 'Brand DNA Engine',
    body: 'Define your brand once — colors, style, shape language, material, and lighting rules. Every asset generated inherits the full system.',
  },
  {
    icon: '⚡',
    title: 'AI Generation',
    body: 'Built on Imagen 4. Describe what you need and watch the AI translate your Brand DNA into a pixel-perfect asset in seconds.',
  },
  {
    icon: '◈',
    title: 'Consistent Kit',
    body: 'Navigation icons, glyphs, badges, tokens, app icons, and UI symbols — all from the same visual language, every time.',
  },
]

const STEPS = [
  { n: '01', title: 'Define your Brand DNA', body: 'Set your colors, style, shape rules, and asset constraints once. This becomes the foundation for every asset you generate.' },
  { n: '02', title: 'Pick an asset type',    body: 'Choose from navigation icons, glyphs, achievement badges, reward tokens, app icons, or UI symbols.' },
  { n: '03', title: 'Generate & download',   body: 'Describe the asset in plain language. The AI builds a specification from your Brand DNA and generates a crisp PNG.' },
]

const PLANS = [
  {
    key: 'pro',
    label: 'Pro',
    price: '$39',
    period: '/mo',
    popular: true,
    features: ['100 assets per month', '30-day download links', 'All 6 asset types', 'Brand DNA engine', 'Priority generation'],
    cta: 'Upgrade to Pro',
    href: '/signup',
  },
  {
    key: 'starter',
    label: 'Starter',
    price: '$9',
    period: '/mo',
    popular: false,
    features: ['20 assets per month', '7-day download links', 'All 6 asset types', 'Brand DNA engine'],
    cta: 'Get Starter',
    href: '/signup',
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    price: '$79',
    period: ' one-time',
    popular: false,
    features: ['Unlimited assets forever', '365-day download links', 'All 6 asset types', 'Brand DNA engine', 'All future features'],
    cta: 'Get Lifetime Access',
    href: '/signup',
  },
  {
    key: 'free',
    label: 'Free',
    price: '$0',
    period: '',
    popular: false,
    features: ['5 assets per month', '3-day download links', 'All 6 asset types', 'Brand DNA engine'],
    cta: 'Start free',
    href: '/signup',
  },
]

const ASSET_TYPES = ['🧭', '✦', '🏅', '🪙', '📱', '◈']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <svg className="w-4 h-4 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight">Iconic</span>
          </div>

          <nav className="hidden sm:flex items-center gap-4 ml-4">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-zinc-900 transition-colors"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-24 sm:pt-28 sm:pb-32 px-4">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(251,191,36,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Powered by Imagen 4 · Brand-consistent AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5">
            Brand-consistent AI assets.{' '}
            <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
              In minutes.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Define your Brand DNA once. Generate icon sets, badges, tokens, and UI symbols
            that stay visually consistent across your entire product — every time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}
            >
              Start for free
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-medium text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-colors"
            >
              See how it works →
            </a>
          </div>

          {/* Asset preview row */}
          <div className="mt-14 flex items-center justify-center gap-3 flex-wrap">
            {ASSET_TYPES.map((icon, i) => (
              <div
                key={i}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-2xl sm:text-3xl backdrop-blur"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {icon}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            Navigation Icons · Glyphs · Badges · Tokens · App Icons · UI Symbols
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything your brand needs</h2>
            <p className="text-zinc-400 text-sm max-w-md mx-auto">
              One engine. Six asset types. Total visual consistency.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 border-t border-zinc-800/60">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How it works</h2>
            <p className="text-zinc-400 text-sm">From brand brief to downloadable assets in three steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="flex flex-col">
                <div className="text-4xl font-black text-zinc-800 mb-4">{s.n}</div>
                <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Simple pricing</h2>
            <p className="text-zinc-400 text-sm">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map(p => (
              <div
                key={p.key}
                className={`relative rounded-2xl border p-5 flex flex-col gap-4 ${
                  p.popular
                    ? 'border-amber-500/60 bg-zinc-900 ring-1 ring-amber-500/20'
                    : 'border-zinc-800 bg-zinc-900/40'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-zinc-900 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={p.popular ? 'mt-1' : ''}>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">{p.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {p.price}
                    <span className="text-sm font-normal text-zinc-500">{p.period}</span>
                  </p>
                </div>

                <ul className="flex flex-col gap-2 flex-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                      <svg className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={p.href}
                  className={`mt-auto w-full py-2 rounded-lg text-xs font-semibold text-center transition-colors ${
                    p.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-900'
                      : p.key === 'lifetime'
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-zinc-600 mt-8">
            Monthly subscriptions cancel anytime. Lifetime is a one-time payment — no recurring charges ever.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/60 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <svg className="w-3.5 h-3.5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <span className="text-sm font-bold">Iconic</span>
            <span className="text-xs text-zinc-600 ml-2">AI Design System for Founders</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-zinc-400 transition-colors">Sign up</Link>
            <a href="#pricing" className="hover:text-zinc-400 transition-colors">Pricing</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
