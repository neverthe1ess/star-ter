"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { regist } from "@/services/auth/auth.api";

interface RegisterPageProps {
  onRegister: () => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await regist({ email, password, nickname });
      onRegister();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
     window.location.href = 'http://localhost:4000/auth/google';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Overall Background Split */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-slate-50" />
        <div className="w-1/2 relative">
          <Image src="/images/pexels.jpg" alt="Background Section" fill className="object-cover opacity-85" />
          <div className="absolute inset-0 bg-slate-200/90" />
        </div>
      </div>

      <div className="relative z-10 w-[74vw] h-[72vh] min-h-[600px] bg-white flex rounded-xs shadow-lg overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/3 relative flex flex-col px-8 pb-8 pt-4 lg:px-10 lg:pb-8 lg:pt-6 overflow-y-auto">
          {/* Header - Fixed Top Left */}
          <div className="absolute top-6 left-8 lg:top-10 lg:left-14">
            <h1 className="text-[22px] xl:text-[26px] 2xl:text-[30px] font-bold text-[#2d55ff] leading-tight">STARTER</h1>
            <p className="text-gray-500 text-[10px] xl:text-[11px] 2xl:text-[12px] -mt-1 xl:-mt-1">Commercial Area Analysis Service</p>
          </div>

          {/* Centered Form Area */}
          <div className="flex-1 flex items-center justify-center w-full px-3 xl:px-4">
            <div className="w-full max-w-sm xl:max-w-lg 2xl:max-w-xl">
              <form onSubmit={handleRegister} className="w-full">
                {/* Unified Form Group */}
                <div className="space-y-6">
                  {/* Inputs Group */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label htmlFor="nickname" className="block text-[10px] xl:text-[11px] 2xl:text-[12px] font-medium text-gray-700">
                         Nickname
                      </label>
                      <Input
                        id="nickname"
                        type="text"
                        placeholder="Nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        required
                        className="h-9 xl:h-9 2xl:h-10 bg-white border-gray-200 focus:!border-[#2d55ff] focus:!ring-[#2d55ff] rounded-xs transition-all !text-[10px] xl:!text-[11px] 2xl:!text-[12px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-[10px] xl:text-[11px] 2xl:text-[12px] font-medium text-gray-700">
                         Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-9 xl:h-9 2xl:h-10 bg-white border-gray-200 focus:!border-[#2d55ff] focus:!ring-[#2d55ff] rounded-xs transition-all !text-[10px] xl:!text-[11px] 2xl:!text-[12px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="password" className="block text-[10px] xl:text-[11px] 2xl:text-[12px] font-medium text-gray-700">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-9 xl:h-9 2xl:h-10 bg-white border-gray-200 focus:!border-[#2d55ff] focus:!ring-[#2d55ff] rounded-xs transition-all !text-[10px] xl:!text-[11px] 2xl:!text-[12px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="confirmPassword" className="block text-[10px] xl:text-[11px] 2xl:text-[12px] font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-9 xl:h-9 2xl:h-10 bg-white border-gray-200 focus:!border-[#2d55ff] focus:!ring-[#2d55ff] rounded-xs transition-all !text-[10px] xl:!text-[11px] 2xl:!text-[12px]"
                      />
                    </div>
                  </div>

                  {/* Buttons Group */}
                  <div className="flex items-center gap-5">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-1/4 h-8 xl:h-8 2xl:h-9 bg-[#2d55ff] hover:bg-[#1a40db] text-white font-semibold rounded-xs transition-colors shadow-md shadow-blue-500/20 text-[10px] xl:text-[12px] 2xl:text-[14px]"
                    >
                      {isSubmitting ? "Creating..." : "Sign Up"}
                    </Button>
                    
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      className="text-[9px] xl:text-[10px] 2xl:text-[11px] text-gray-500 hover:text-gray-700 transition-colors border-b border-gray-300"
                    >
                      Are you a Google member?
                    </button>
                  </div>
                </div>
                
                {error && <p className="text-sm xl:text-base text-red-600 text-center bg-red-50 p-2 rounded mt-4">{error}</p>}
              </form>
            </div>
          </div>

          {/* Bottom centered text */}
          <div className="absolute bottom-6 left-0 w-full text-center px-8 text-[10px] xl:text-[11px] 2xl:text-[12px] text-gray-500">
            Already have an account? <Link href="/login" className="text-[#2d55ff] font-medium border-b border-[#2d55ff] hover:text-[#1a40db]">Login</Link>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block w-2/3 relative bg-gray-100">
          <Image 
            src="/images/pexels.jpg" 
            alt="Register Visual" 
            fill
            priority
            quality={100}
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" /> 
        </div>
      </div>
    </div>
  );
}
