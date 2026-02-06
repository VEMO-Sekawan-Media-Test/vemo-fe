'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input, Button } from '@/components/ui';
import { User, Shield } from 'lucide-react';
import { SLIDESHOW_IMAGES } from '@/constants';

type UserRole = 'ADMIN' | 'APPROVER';

const Slideshow = ({ currentSlide }: { currentSlide: number }) => {
  return (
    <div className="relative h-48 bg-[#1E293B] overflow-hidden">
      {SLIDESHOW_IMAGES.map((slide, index) => {
        const isActive = index === currentSlide;
        
        return (
          <div
            key={index}
            className={`absolute inset-0 ${isActive ? 'animate-zoom' : ''}`}
            style={{
              opacity: isActive ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
            }}
          >
            <img 
              src={slide.url} 
              alt={slide.alt} 
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B]/60 via-[#1E293B]/40 to-[#1E293B]" />
      
      {/* Logo and text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
        <Image src="/images/vemo_ic.png" alt="VEMO Logo" width={90} height={90} />
        <h1 className="text-xl font-bold text-white mt-1">VEMO</h1>
        <p className="text-gray-300 text-sm">Vehicle Monitoring System</p>
      </div>
    </div>
  );
};

const RoleSelection = ({
  selectedRole,
  onSelect,
}: {
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
}) => (
  <div className="grid grid-cols-2 gap-3">
    {(['ADMIN', 'APPROVER'] as UserRole[]).map(role => (
      <button
        key={role}
        type="button"
        onClick={() => onSelect(role)}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
          selectedRole === role
            ? 'border-[#1E293B] bg-[#1E293B] text-white'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
        }`}
      >
        {role === 'ADMIN' ? <Shield size={16} /> : <User size={16} />}
        <span className="text-sm font-medium">
          {role === 'ADMIN' ? 'Admin' : 'Approver'}
        </span>
      </button>
    ))}
  </div>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;

    if (!username || !password) {
      setError('Mohon isi username dan password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Username atau password salah');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] text-[#334155]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Slideshow currentSlide={currentSlide} />

          <div className="px-8 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account Type
            </label>
            <RoleSelection selectedRole={selectedRole} onSelect={setSelectedRole} />
          </div>

          <div className="p-8 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Input
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
            />

            <Button
              type="button"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              onClick={handleLogin}
            >
              Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'Approver'}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          © 2026 VEMO - Mining Vehicle Monitoring
        </p>
      </div>
    </div>
  );
}
