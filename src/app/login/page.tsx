'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input, Button } from '@/components/ui';
import { User, Shield } from 'lucide-react';
import { SLIDESHOW_IMAGES, DEMO_CREDENTIALS } from '@/constants';

type UserRole = 'ADMIN' | 'APPROVER';

const Slideshow = ({ currentSlide }: { currentSlide: number }) => (
  <div className="relative h-48 bg-[#1E293B] overflow-hidden">
    {SLIDESHOW_IMAGES.map((slide, index) => {
      const isActive = index === currentSlide;
      return (
        <div
          key={index}
          className={`absolute inset-0 ${isActive ? 'animate-zoom-in' : ''}`}
          style={{
            animation: isActive ? 'zoomIn 6s linear infinite' : 'none',
            opacity: isActive ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
          }}
        >
          <img src={slide.url} alt={slide.alt} className="w-full h-full object-cover" />
        </div>
      );
    })}
    <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B]/60 via-[#1E293B]/40 to-[#1E293B]" />
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
      <div className="mb-2">
        <Image src="/images/vemo_ic.png" alt="VEMO Truck Logo" width={90} height={90} />
      </div>
      <h1 className="text-xl font-bold text-white text-center">VEMO</h1>
      <p className="text-gray-300 text-center text-sm">Vehicle Monitoring System</p>
    </div>
  </div>
);

const RoleSelection = ({ selectedRole, onSelect }: { selectedRole: UserRole; onSelect: (role: UserRole) => void }) => (
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
        {role === 'ADMIN' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
        <span className="text-sm font-medium cursor-pointer">{role === 'ADMIN' ? 'Admin' : 'Approver'}</span>
      </button>
    ))}
  </div>
);

export default function LoginPage() {
  const [username, setUsername] = useState(DEMO_CREDENTIALS.ADMIN.username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.ADMIN.password);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);
  
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % SLIDESHOW_IMAGES.length), 6000);
    return () => clearInterval(interval);
  }, [isMounted]);
  
  useEffect(() => {
    setUsername(DEMO_CREDENTIALS[selectedRole].username);
    setPassword(DEMO_CREDENTIALS[selectedRole].password);
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally { setIsLoading(false); }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Slideshow currentSlide={currentSlide} />
          
          <div className="px-8 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Account Type</label>
            <RoleSelection selectedRole={selectedRole} onSelect={setSelectedRole} />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            
            <Input label="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter your username" autoComplete="username" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
            
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'Approver'}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-sm text-gray-500 mt-4">© 2026 VEMO - Mining Vehicle Monitoring</p>
      </div>
    </div>
  );
}
