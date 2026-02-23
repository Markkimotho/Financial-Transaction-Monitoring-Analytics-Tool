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
      title: 'Smart Analytics',
      description: 'AI-powered insights into your spending patterns and financial health',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Lock,
      title: 'Bank-Level Security',
      description: 'Enterprise-grade encryption keeps your financial data safe',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Instant transaction monitoring across all your accounts',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Budget Planning',
      description: 'Set goals and get alerts when you\'re close to limits',
      color: 'from-green-500 to-emerald-500'
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '$2B+', label: 'Tracked' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .hero-gradient {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        }
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-8px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .blob {
          position: absolute;
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          filter: blur(80px);
          opacity: 0.3;
        }
      `}</style>

      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob absolute top-10 right-10 w-72 h-72 bg-blue-500 animate-blob"></div>
        <div className="blob absolute bottom-20 left-10 w-72 h-72 bg-purple-500 animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <PieChart className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold gradient-text">FinTrack</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Sign in</Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="animate-slide-in space-y-8 text-center">
            <div className="inline-block">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
                <p className="text-sm text-blue-300 font-medium">Welcome to Financial Finance</p>
              </div>
            </div>

            <h2 className="text-6xl md:text-7xl font-bold leading-tight">
              Take Control of Your
              <span className="block mt-2 gradient-text">Financial Future</span>
            </h2>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Real-time transaction monitoring, intelligent analytics, and budgeting tools that empower you to make smarter financial decisions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
                Start Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-white rounded-lg font-semibold hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm">
                Sign In
              </Link>
            </div>

            <p className="text-gray-500 text-sm">No credit card required • 14-day free trial</p>
          </div>
        </div>

        {/* Scrolling element */}
        <div className="absolute bottom-10 animate-float">
          <ChevronRight className="w-6 h-6 text-gray-500 animate-pulse-glow transform -rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Powerful features for control</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to manage, monitor, and optimize your finances in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div 
                  key={idx} 
                  className="card-hover group relative p-6 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl hover:border-blue-500/50 backdrop-blur-sm"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">{feature.title}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-8 bg-gray-900/50 border border-gray-800 rounded-lg backdrop-blur-sm hover:border-gray-700 transition-all duration-300">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            <div className="relative z-10 text-center">
              <h3 className="text-4xl md:text-5xl font-bold mb-4">Ready to transform your finances?</h3>
              <p className="text-gray-300 text-lg mb-8">Join thousands of users already managing their money smarter with FinTrack.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
                  Get Started Free
                </Link>
                <Link to="/login" className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-white rounded-lg font-semibold hover:bg-gray-700/50 transition-all duration-300">
                  Already a member?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold">FinTrack</h4>
              </div>
              <p className="text-gray-400 text-sm">Empowering financial decisions through real-time monitoring and intelligent analytics.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} FinTrack. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">LinkedIn</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
