import React from 'react';
import { ShieldCheck, PhoneCall, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Portal Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-emerald-400">🌾</span> Pradhan Mantri Fasal Bima Yojana
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              National crop insurance portal providing comprehensive financial coverage against non-preventable natural risks, stabilized farmer incomes, and expedited DBT settlement.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Direct Benefit Transfer (DBT) Compliant
            </div>
          </div>

          {/* Col 2: Kisan Helpline */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Kisan Support</h4>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <PhoneCall className="w-4 h-4" /> 1800-180-1551
              </div>
              <p className="text-[11px] text-slate-400">Toll-Free All India Farmer Support (24x7)</p>
            </div>
            <p className="text-[11px] text-slate-400">Email: helpdesk-pmfby@gov.in</p>
          </div>

          {/* Col 3: PMFBY Premium Rates */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Statutory Premium Rates</h4>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Kharif Food & Oilseeds:</span> <strong className="text-slate-200">2.0% Max</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Rabi Food & Oilseeds:</span> <strong className="text-slate-200">1.5% Max</strong>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Commercial / Horticultural:</span> <strong className="text-slate-200">5.0% Max</strong>
              </li>
              <li className="flex justify-between text-emerald-400">
                <span>Balance Premium:</span> <strong>50% Centre / 50% State</strong>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div className="space-y-2">
            <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider">Trust & Security</h4>
            <p className="text-[11px] text-slate-400">
              Department of Agriculture and Farmers Welfare (DA&FW), Ministry of Agriculture & Farmers Welfare, Government of India.
            </p>
            <div className="flex items-center gap-2 text-slate-300 text-[11px] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> End-to-End Cryptographic Audit Logging
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div>
            © {new Date().getFullYear()} PMFBY Agricultural Crop Insurance & Loss Assessment Portal. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span className="hover:text-slate-300">Terms of Service</span>
            <span className="hover:text-slate-300">Hyperlinking Policy</span>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">v2.4-STABLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
