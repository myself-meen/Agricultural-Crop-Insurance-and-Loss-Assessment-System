import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Sprout, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  FileCheck2, 
  Cpu, 
  Users 
} from 'lucide-react';

export const Home = () => {
  const { isAuthenticated, role } = useAuth();

  const features = [
    {
      icon: <Sprout className="w-6 h-6 text-emerald-400" />,
      title: 'Minimal Premium Rates',
      desc: 'Uniform low premium for farmers: 2% for Kharif food/oilseeds, 1.5% for Rabi, and 5% for commercial/horticultural crops.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-blue-400" />,
      title: 'Geo-Tagged Damage Surveys',
      desc: 'Accurate loss assessment with on-ground GPS coordinates and timestamped photographic evidence.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
      title: 'Two-Tier Actuarial Review',
      desc: 'Strict L1 and L2 claim verification pipeline ensures transparency and eliminates fraudulent filings.',
    },
    {
      icon: <CreditCard className="w-6 h-6 text-teal-400" />,
      title: 'Direct Benefit Transfer (DBT)',
      desc: 'Approved insurance payouts are disbursed directly into verified farmer bank accounts with RBI UTR generation.',
    },
  ];

  const steps = [
    { num: '01', title: 'Enroll Crop Policy', desc: 'Provide land & Khasra details with subsidized premium calculation.' },
    { num: '02', title: 'Report Loss Incident', desc: 'Instant intimation of flood, drought, or pest loss with GPS coordinates.' },
    { num: '03', title: 'Surveyor Field Assessment', desc: 'Accredited field surveyor assesses yield loss and uploads verification.' },
    { num: '04', title: 'DBT Claim Settlement', desc: 'Two-tier officer clearance followed by electronic bank disbursement.' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          PMFBY National Insurance Grid Active
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Comprehensive Crop Security <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            For India's Annadatas
          </span>
        </h1>

        <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Pradhan Mantri Fasal Bima Yojana provides complete financial shielding against non-preventable natural calamities, 
          empowering farmers with rapid loss intimation, satellite-verified assessment, and swift DBT claim settlement.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              Go to {role} Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
                Access Portal (Sign In) <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-6 py-3">
                Farmer Registration
              </Link>
            </>
          )}
        </div>

        {/* Statutory Rate Summary Card */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="glass-card p-4 border-emerald-500/30">
            <div className="text-xs text-slate-400 uppercase font-semibold">Kharif Crops</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">2.0%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Max farmer share (Food & Oilseeds)</div>
          </div>
          <div className="glass-card p-4 border-teal-500/30">
            <div className="text-xs text-slate-400 uppercase font-semibold">Rabi Crops</div>
            <div className="text-2xl font-bold text-teal-400 mt-1">1.5%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Max farmer share (Food & Oilseeds)</div>
          </div>
          <div className="glass-card p-4 border-cyan-500/30">
            <div className="text-xs text-slate-400 uppercase font-semibold">Horticulture / Zaid</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">5.0%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Commercial & annual crops</div>
          </div>
          <div className="glass-card p-4 border-gold/30">
            <div className="text-xs text-slate-400 uppercase font-semibold">Govt Subsidy</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">50:50</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Central & State equal share</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Why the PMFBY Digital Platform?</h2>
          <p className="text-slate-400 text-sm mt-2">End-to-end digitisation from policy generation to direct bank credit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 flex flex-col justify-between">
              <div>
                <div className="p-3 w-fit rounded-xl bg-slate-800/80 mb-4 border border-slate-700/60">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step Process Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-card p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Lifecycle of a Crop Insurance Claim</h2>
            <p className="text-slate-400 text-sm mt-2">Transparent, automated, and tamper-proof verification workflow.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 relative">
                <span className="text-3xl font-black text-emerald-500/20 font-mono block mb-2">
                  {step.num}
                </span>
                <h4 className="text-base font-bold text-white mb-1.5">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
