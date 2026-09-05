import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { 
  Sprout, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  ClipboardCheck, 
  CreditCard, 
  BarChart3, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  UserCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, isAuthenticated, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (targetRole) => {
    try {
      await quickSwitchRole(targetRole);
      setRoleMenuOpen(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Role-specific navigation items
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
        { label: 'Register', path: '/register' },
      ];
    }

    const links = [{ label: 'Dashboard', path: '/dashboard', icon: BarChart3 }];

    if (role === 'FARMER') {
      links.push(
        { label: 'My Profile', path: '/profile', icon: UserCheck },
        { label: 'Policies', path: '/policies', icon: ShieldCheck },
        { label: 'Enroll Policy', path: '/enroll', icon: FileText },
        { label: 'Report Loss', path: '/report-loss', icon: AlertTriangle }
      );
    } else if (role === 'SURVEYOR') {
      links.push(
        { label: 'Assigned Surveys', path: '/surveys', icon: ClipboardCheck }
      );
    } else if (role === 'INSURER') {
      links.push(
        { label: 'Policies', path: '/policies', icon: ShieldCheck },
        { label: 'Surveys', path: '/surveys', icon: ClipboardCheck },
        { label: 'Claims & DBT', path: '/claims', icon: CreditCard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 }
      );
    } else if (role === 'BANK_OFFICER') {
      links.push(
        { label: 'Policies', path: '/policies', icon: ShieldCheck },
        { label: 'Claims & DBT', path: '/claims', icon: CreditCard }
      );
    } else if (role === 'STATE_OFFICER') {
      links.push(
        { label: 'Claims Review', path: '/claims', icon: CreditCard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit-logs', icon: FileText }
      );
    } else if (role === 'ADMIN') {
      links.push(
        { label: 'User Directory', path: '/users', icon: Users },
        { label: 'Policies', path: '/policies', icon: ShieldCheck },
        { label: 'Claims & DBT', path: '/claims', icon: CreditCard },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Audit Logs', path: '/audit-logs', icon: FileText }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  PMFBY
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Gov of India
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Crop Insurance & Loss Assessment Portal
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive(item.path)
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* 1-Click Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Switch demo persona instantly"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Demo Roles</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Persona to Test
                  </div>
                  {DEMO_USERS.map((demo) => (
                    <button
                      key={demo.role}
                      onClick={() => handleQuickSwitch(demo.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                        role === demo.role ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-300'
                      }`}
                    >
                      <span>{demo.label}</span>
                      <span className="text-[10px] text-slate-500">{demo.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
                <div className="text-right">
                  <div className="text-xs font-semibold text-white">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-emerald-400 font-mono tracking-wider">{role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="p-2 text-xs bg-slate-800 text-slate-300 rounded-lg border border-slate-700"
            >
              Demo Roles
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Demo Dropdown */}
        {roleMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-2 bg-slate-900/95">
            <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Switch Test Role:
            </div>
            <div className="grid grid-cols-2 gap-1 px-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleQuickSwitch(demo.role)}
                  className={`text-left p-2 rounded text-xs ${
                    role === demo.role ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-300 bg-slate-800/60'
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-md font-medium text-base flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.name})
              </button>
            ) : (
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-slate-800 text-white rounded-lg text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-emerald-600 text-white rounded-lg text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
