import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/40 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full opacity-90" />
              </div>
              <span className="text-white font-bold text-lg">Athira<span className="text-blue-500">Tech</span></span>
            </div>
            <p className="text-sm text-slate-500">
              Enterprise-grade AI solutions for the modern software development lifecycle.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Product</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/ai-software-engineer" className="hover:text-blue-400 transition-colors">AI Engineer</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="/services" className="hover:text-blue-400 transition-colors">Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Agents</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/agents" className="hover:text-blue-400 transition-colors">All Agents</Link></li>
              <li><Link href="/agents/planning" className="hover:text-blue-400 transition-colors">Planning</Link></li>
              <li><Link href="/agents/development" className="hover:text-blue-400 transition-colors">Development</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-blue-400 transition-colors">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800/40 text-sm text-center flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Athira Technology. All rights reserved.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
