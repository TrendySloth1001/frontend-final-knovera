'use client';

import { useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

/**
 * Knovera AI Welcome Page
 * A React-based chalkboard interface featuring live time/date, 
 * responsive hand-drawn doodles, and a Dr. APJ Abdul Kalam quote.
 */

export default function LoginBoard() {
  const [time, setTime] = useState('00:00:00');
  const [date, setDate] = useState('Loading...');

  // Update clock and date every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    window.location.href = authAPI.googleLogin();
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden font-['Architects_Daughter',_cursive] selection:bg-gray-700 selection:text-white">
      {/* Font Import */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap" rel="stylesheet" />
      
      {/* Blackboard Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .chalkboard-bg {
          background-color: #0a0a0a;
          background-image: 
            radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            url('https://www.transparenttextures.com/patterns/black-chalkboard.png');
          background-size: 50px 50px, auto;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .floating {
          animation: float 10s ease-in-out infinite;
        }

        .doodle-hover:hover {
          filter: blur(0px);
          transform: scale(1.05);
          transition: all 0.5s ease;
        }
      `}} />

      {/* Main Whiteboard Container */}
      <div className="whiteboard relative w-[96vw] h-[92vh] md:w-[94vw] md:h-[90vh] chalkboard-bg border-[10px] md:border-[14px] border-[#332b21] rounded-lg shadow-[inset_0_0_100px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-5 text-center">
        
        {/* Live Clock & Date */}
        <div className="absolute top-6 left-6 md:top-10 md:left-12 text-left z-20 pointer-events-none">
          <div className="text-white text-xs md:text-base opacity-80" id="date">{date}</div>
          <div className="text-[#add8e673] text-xl md:text-3xl font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" id="time">{time}</div>
        </div>

        {/* APJ Abdul Kalam Quote */}
        <div className="absolute bottom-10 left-6 right-6 md:left-14 md:bottom-14 md:max-w-md text-left z-10 pointer-events-none">
          <p className="text-[#ffffffe0] text-base md:text-xl italic mb-2 leading-relaxed opacity-90">
            "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, knowledge makes you great."
          </p>
          <p className="text-[#ffffffe0] text-sm md:text-base font-bold opacity-70">
            — <span className="underline decoration-1 underline-offset-4">Dr. APJ Abdul Kalam</span>
          </p>
        </div>

        {/* --- Doodles --- */}

        {/* Atom/Physics (Blue) */}
        <div className="doodle floating doodle-hover absolute top-[10%] right-[8%] text-[#add8e673] blur-[0.4px] hidden sm:block">
          <svg width="120" height="120" viewBox="0 0 100 100" stroke="currentColor" fill="none">
            <ellipse cx="50" cy="50" rx="40" ry="15" strokeWidth="1.5" transform="rotate(0 50 50)"/>
            <ellipse cx="50" cy="50" rx="40" ry="15" strokeWidth="1.5" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="40" ry="15" strokeWidth="1.5" transform="rotate(120 50 50)"/>
            <circle cx="50" cy="50" r="4" fill="currentColor"/>
            <text x="55" y="45" fill="currentColor" fontSize="8">Quantum</text>
          </svg>
        </div>

        {/* Light/Prism (Pink) */}
        <div className="doodle doodle-hover absolute top-[35%] left-[4%] text-[#ffb6c173] blur-[0.4px] hidden md:block">
          <svg width="150" height="100" viewBox="0 0 150 100" stroke="currentColor" fill="none">
            <path d="M10,50 L50,50 L80,20 L140,20 M80,20 L140,35 M80,20 L140,50 M80,20 L140,65" strokeWidth="1.5"/>
            <path d="M45,40 L55,40 L50,60 Z" strokeWidth="2"/>
            <text x="10" y="40" fill="currentColor" fontSize="10">Spectrum</text>
          </svg>
        </div>

        {/* Math Formulas (Yellow) */}
        <div className="doodle floating absolute bottom-[15%] right-[6%] text-[#ffffe073] blur-[0.4px] text-right leading-relaxed opacity-80 pointer-events-none" style={{ animationDelay: '-3s' }}>
          <p className="text-sm md:text-lg">
            ∑ (xᵢ - μ)² / n <br />
            e = mc² <br />
            ∫₀ᵅ sin(x) dx
          </p>
        </div>

        {/* Space/Rocket (White) */}
        <div className="doodle absolute top-[15%] right-[45%] text-white opacity-20 blur-[0.4px] hidden sm:block">
          <svg width="50" height="80" viewBox="0 0 60 100" fill="none" stroke="currentColor">
            <path d="M30,10 Q50,40 50,80 L10,80 Q10,40 30,10" strokeWidth="2"/>
            <path d="M20,80 L20,95 M40,80 L40,95 M30,80 L30,95" strokeWidth="1.5"/>
            <text x="0" y="5" fill="currentColor" fontSize="8">SLV-3</text>
          </svg>
        </div>

        {/* Chemistry (Green) */}
        <div className="doodle doodle-hover absolute bottom-[25%] left-[8%] text-[#90ee9059] blur-[0.4px] hidden lg:block">
          <svg width="90" height="90" viewBox="0 0 100 100" stroke="currentColor" fill="none">
            <path d="M30,20 L70,20 L80,40 L70,60 L30,60 L20,40 Z" strokeWidth="1.5"/>
            <path d="M35,25 L65,25 M75,40 L65,55" strokeWidth="1.2"/>
            <text x="35" y="45" fill="currentColor" fontSize="12">C₆H₆</text>
          </svg>
        </div>

        {/* --- Central Branding Content --- */}
        <div className="z-10 flex flex-col items-center">
          <h1 className="text-white text-4xl md:text-7xl lg:text-9xl font-bold mb-2 drop-shadow-[3px_3px_10px_rgba(255,255,255,0.2)]">
            knovera Ai :-
          </h1>
          <p className="text-[#add8e6e6] text-lg md:text-2xl mb-12 opacity-90 max-w-[80%]">
            The path to greatness begins with a single thought.
          </p>

          <button 
            onClick={handleLogin}
            className="group relative bg-white text-[#3c4043] px-6 py-4 md:px-10 md:py-5 rounded-lg font-bold text-lg md:text-xl flex items-center gap-4 transition-all duration-200 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4),8px_8px_0px_rgba(173,216,230,0.5)] hover:-translate-y-1 hover:-translate-x-1"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
            </svg>
            Sign in to start learning
          </button>
        </div>

        {/* Chalk Tray Decor */}
        <div className="tray absolute -bottom-3 md:-bottom-4 w-[60%] max-w-[350px] h-3 md:h-4 bg-[#2a221a] rounded-b-xl shadow-[0_4px_10px_rgba(0,0,0,0.4)]"></div>
      </div>
    </div>
  );
}