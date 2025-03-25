import { useState } from "react";
import { Link } from "wouter";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            AI
          </div>
          <h1 className="text-xl font-semibold text-gray-800">AI Virtual Try-On</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <Link href="/">
            <a className="text-gray-700 hover:text-blue-500 transition-colors">Trang chủ</a>
          </Link>
          <a href="#features" className="text-gray-700 hover:text-blue-500 transition-colors">Dịch vụ</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-blue-500 transition-colors">Giới thiệu</a>
          <a href="#testimonials" className="text-gray-700 hover:text-blue-500 transition-colors">Liên hệ</a>
        </nav>
        
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-3 bg-white border-t border-gray-100">
          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <a className="text-gray-700 hover:text-blue-500 transition-colors py-1">Trang chủ</a>
            </Link>
            <a href="#features" className="text-gray-700 hover:text-blue-500 transition-colors py-1">Dịch vụ</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-blue-500 transition-colors py-1">Giới thiệu</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-500 transition-colors py-1">Liên hệ</a>
          </nav>
        </div>
      )}
    </header>
  );
}
