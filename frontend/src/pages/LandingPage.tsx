import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, Lock, Zap, BarChart3, PieChart, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: TrendingUp,
      title: 'Live Analytics',
      description: 'Deep insights into spending patterns with real-time data visualization',
      accent: 'frost-3'
    },
    {
      icon: Lock,
      title: 'Cryptographic Security',
      description: 'Military-grade encryption on all financial data transfers',
      accent: 'frost-2'
    },
    {
      icon: Zap,
      title: 'Instant Sync',
      description: 'Millisecond transaction updates across all connected accounts',
      accent: 'aurora3'
    },
    {
      icon: BarChart3,
      title: 'Predictive Budgets',
      description: 'AI-assisted goal planning with anomaly detection',
      accent: 'aurora4'
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users', accent: 'frost-3' },
    { value: '$2B+', label: 'Monitored Assets', accent: 'aurora4' },
    { value: '99.9%', label: 'System Uptime', accent: 'aurora3' },
  ]

  return (
    <div className="min-h-screen bg-nord-0 text-nord-4 overflow-hidden">
      <style>{`
        .mesh-gradient {
          background: linear-gradient(135deg, rgba(129, 161, 193, 0.15) 0%, rgba(136, 192, 208, 0.1) 25%, rgba(139, 188, 187, 0.08) 50%, rgba(163, 190, 140, 0.15) 100%);
        }
        .terminal-border {
          border-left: 3px solid rgba(191, 97, 106, 0.4);
          padding-left: 1rem;
        }
        .glow-text {
          text-shadow: 0 0 30px rgba(208, 135, 112, 0.4);
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-nord-1/80 backdrop-blur-md border-b border-nord-3/30' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <PieChart className="w-6 h-6 text-frost-3 group-hover:text-frost-2 transition-colors" />
            <h1 className="text-xl font-display font-700 bg-gradient-to-r from-frost-3 to-frost-2 bg-clip-text text-transparent">FinTrack</h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-nord-4 hover:text-frost-2 transition-colors font-mono text-sm font-500">$ login</Link>
            <Link to="/register" className="px-6 py-2.5 bg-gradient-to-r from-aurora-2 to-aurora-1 text-nord-0 rounded-lg font-display font-600 hover:shadow-lg hover:shadow-aurora-1/40 transition-all duration-200 transform hover:scale-105 text-sm">
              get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16 mesh-gradient">
        {/* Decorative element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl opacity-10 bg-frost-3"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 rounded-full blur-3xl opacity-10 bg-aurora4"></div>
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10">
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block animate-fade-in">
              <div className="px-4 py-2 bg-nord-2/40 border border-frost-3/30 rounded-2xl backdrop-blur-sm hover:border-frost-3/60 transition-all">
                <p className="text-sm text-frost-3 font-mono uppercase tracking-wider">→ The future of finance starts here</p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-display font-700 leading-tight tracking-tight">
                Take Control
                <br />
                <span className="bg-gradient-to-r from-aurora-2 via-frost-2 to-frost-3 bg-clip-text text-transparent">of Your Assets</span>
              </h2>

              <p className="text-xl text-nord-5 max-w-3xl leading-relaxed">
                Real-time transaction monitoring. Predictive analytics. Intelligent budgeting. All in one dashboard designed for modern financial decision-making.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-aurora-2 to-aurora-1 text-nord-0 rounded-lg font-display font-600 flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-aurora-1/40 transition-all duration-200 transform hover:scale-105">
                Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/api-docs" className="px-8 py-4 bg-frost-3/20 border border-frost-3/50 text-frost-2 rounded-lg font-display font-600 hover:bg-frost-3/30 hover:border-frost-3/70 transition-all duration-200">
                API Docs
              </Link>
            </div>

            <p className="text-nord-3 text-sm">• No credit card required • 14-day free trial • Instant activation</p>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="w-6 h-6 text-nord-3 rotate-90" />
          </div>
        </div>
      </section>

      {/* Features Section - Asymmetric Grid */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-nord-0 to-nord-1/40">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20">
            <p className="text-aurora-2 font-mono text-sm uppercase tracking-widest mb-4">Features</p>
            <h3 className="text-5xl md:text-6xl font-display font-700 leading-tight mb-6 text-nord-6">
              Professional tools for
              <br />
              financial control
            </h3>
            <p className="text-frost-2 text-lg max-w-2xl">Everything engineered for precision, performance, and peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              const colSpan = idx === 0 ? 'md:col-span-6' : 'md:col-span-3'
              return (
                <div 
                  key={idx}
                  className={`${colSpan} group animate-stagger-${idx + 1}`}
                >
                  <div className="h-full stat-card bg-gradient-to-br from-nord-2/40 via-nord-1/20 to-nord-0/10 hover:from-nord-2/60 hover:via-nord-1/40 hover:to-nord-0/20">
                    <div className="stat-card-content">
                      <div className={`inline-block p-3 rounded-xl bg-${feature.accent}/10 border border-${feature.accent}/30 mb-4 group-hover:bg-${feature.accent}/20 transition-all`}>
                        <Icon className={`w-6 h-6 text-${feature.accent}`} />
                      </div>
                      <h4 className="text-xl font-display font-600 text-nord-5 mb-3">{feature.title}</h4>
                      <p className="text-nord-3 font-mono text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Terminal Style */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-frost-3 font-mono text-sm uppercase tracking-widest mb-4">By The Numbers</p>
            <h3 className="text-4xl font-display font-700">Trusted by thousands</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className={`stat-card bg-gradient-to-br from-nord-2/40 to-nord-1/20 border-${stat.accent}/30 animate-stagger-${idx + 1}`}>
                <div className="stat-card-content">
                  <div className={`text-5xl font-display font-700 bg-gradient-to-r from-${stat.accent} to-frost-2 bg-clip-text text-transparent mb-3`}>
                    {stat.value}
                  </div>
                  <p className="text-nord-3 font-mono text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-nord-1/40 to-nord-0">
        <div className="max-w-4xl mx-auto">
          <div className="stat-card bg-gradient-to-r from-nord-2/60 to-nord-1/40 border-frost-3/40 overflow-hidden relative">
            {/* Background ornament */}
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-5 bg-frost-3 pointer-events-none"></div>
            
            <div className="stat-card-content relative z-10 text-center">
              <h3 className="text-5xl font-display font-700 text-nord-5 mb-6">Ready to optimize?</h3>
              <p className="text-nord-3 text-lg font-mono mb-10 max-w-2xl mx-auto">
                Join the community of users taking control of their financial future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-frost-3 to-frost-2 text-nord-0 rounded-xl font-display font-600 hover:shadow-2xl hover:shadow-frost-3/30 transition-all duration-200 transform hover:scale-105">
                  Start Free Trial
                </Link>
                <Link to="/api-docs" className="px-8 py-4 bg-nord-3/20 border border-nord-3/40 text-nord-4 rounded-xl font-display font-600 hover:bg-nord-3/30 transition-all duration-200">
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-nord-3/20 py-16 px-6 bg-nord-1/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-6 group">
                <PieChart className="w-5 h-5 text-frost-3 group-hover:text-frost-2 transition-colors" />
                <span className="font-display font-700 text-nord-5">FinTrack</span>
              </Link>
              <p className="text-nord-3 font-mono text-sm leading-relaxed">Empowering financial transparency through real-time monitoring and predictive intelligence.</p>
            </div>
            <div>
              <h5 className="font-display font-600 text-nord-5 mb-4">Product</h5>
              <ul className="space-y-2 text-sm font-mono text-nord-3">
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Features</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Pricing</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-display font-600 text-nord-5 mb-4">Resources</h5>
              <ul className="space-y-2 text-sm font-mono text-nord-3">
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ API Docs</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Blog</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Status</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-display font-600 text-nord-5 mb-4">Legal</h5>
              <ul className="space-y-2 text-sm font-mono text-nord-3">
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Privacy</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Terms</a></li>
                <li><a href="#" className="hover:text-frost-3 transition-colors">→ Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-nord-3/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-nord-3 text-sm font-mono">© {new Date().getFullYear()} FinTrack. All systems operational.</p>
            <div className="flex gap-6">
              <a href="#" className="text-nord-3 hover:text-frost-3 transition-colors font-mono text-sm">Twitter</a>
              <a href="#" className="text-nord-3 hover:text-frost-3 transition-colors font-mono text-sm">GitHub</a>
              <a href="#" className="text-nord-3 hover:text-frost-3 transition-colors font-mono text-sm">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
