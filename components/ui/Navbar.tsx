'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/sia-globe-v2.png"
              alt="SIA Logo"
              width={200}
              height={200}
              className="h-12 w-auto mix-blend-lighten"
            />
          </Link>


         {/* Right Side (Nav + CTA) */}
<div className="hidden md:flex items-center space-x-10 ml-auto">

  {/* Navigation */}
  <div className="flex items-center space-x-12">
    <Link
      href="/"
      className={`transition-colors duration-200 text-base font-medium ${pathname === '/' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
    >
      Home
    </Link>

    <Link
      href="/products"
      className={`transition-colors duration-200 text-base font-medium ${pathname === '/products' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
    >
      Products
    </Link>

    <Link
      href="/about"
      className={`transition-colors duration-200 text-base font-medium ${pathname === '/about' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
    >
      About Us
    </Link>
  </div>

  {/* CTA Button - hidden for now
  <button className="bg-gradient-to-r from-[#f0b849] to-[#f5d687] hover:from-[#f5d687] hover:to-[#f0b849] text-[#0a0a1a] font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
    Get Started
  </button>
  */}
</div>


          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a1a] border-t border-gray-800">
          <div className="px-6 py-4 space-y-3">
            <Link
              href="/"
              className={`block text-base font-medium ${pathname === '/' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <Link
              href="/products"
              className={`block text-base font-medium ${pathname === '/products' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>

            <Link
              href="/about"
              className={`block text-base font-medium ${pathname === '/about' ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>

            {/* Get Started - hidden for now
            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 bg-gradient-to-r from-[#f0b849] to-[#f5d687] text-[#0a0a1a] font-semibold px-6 py-3 rounded-full"
            >
              Get Started
            </button>
            */}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;