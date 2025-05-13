"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
      <div className="bg-gray-900/80  backdrop-blur-md rounded-xl border border-slate-700">
        <div className="mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 transition-all duration-300">
                  Experiment Wizard
                </span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-5 lg:space-x-6">
              <Link 
                href="/" 
                className={`text-gray-300 hover:text-sky-400 transition-colors duration-300 px-3 py-1.5 rounded-md text-base font-semibold ${
                  pathname === '/' ? 'text-sky-400' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                href="/wizard" 
                className={`text-gray-300 hover:text-sky-400 transition-colors duration-300 px-3 py-1.5 rounded-md text-base font-semibold ${
                  pathname === '/wizard' ? 'text-sky-400' : ''
                }`}
              >
                Create Experiment
              </Link>
            </div>
            
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                <svg 
                  className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                
                <svg 
                  className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700">
            <Link 
              href="/" 
              className={`text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-xs font-medium ${
                pathname === '/' ? 'bg-gray-800 text-white' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/wizard" 
              className={`text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-xs font-medium ${
                pathname === '/wizard' ? 'bg-gray-800 text-white' : ''
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Experiment
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}