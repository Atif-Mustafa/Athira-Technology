import { motion } from "motion/react";
import { Mail, MapPin, Phone } from "lucide-react";

export function Contact() {
  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in touch</h1>
          <p className="text-slate-400 text-lg mb-12">
            Interested in transforming your engineering organization? Reach out to our team to schedule a demo or request access to our Enterprise tier.
          </p>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-blue-500 mr-4 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Email</h4>
                <p className="text-slate-400">hello@athiratech.example.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-blue-500 mr-4 mt-1" />
              <div>
                <h4 className="text-white font-medium mb-1">Office</h4>
                <p className="text-slate-400">San Francisco, CA<br/>100 AI Blvd, Suite 400</p>
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-950/40 border border-slate-800 rounded-2xl p-8"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Work Email</label>
              <input type="email" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Company Size</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                <option>1-50 employees</option>
                <option>51-200 employees</option>
                <option>201-1000 employees</option>
                <option>1000+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
              <textarea rows={4} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500/50 resize-none"></textarea>
            </div>
            <button type="button" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-colors">
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
