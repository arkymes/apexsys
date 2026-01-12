
import React from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "" }) => {
  return (
    <div className={`relative group inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-purple opacity-0 group-hover:opacity-70 group-hover:translate-x-1 transition-all duration-75 select-none">{text}</span>
      <span className="absolute top-0 left-0 -z-10 text-cyan opacity-0 group-hover:opacity-70 group-hover:-translate-x-1 transition-all duration-75 select-none">{text}</span>
    </div>
  );
};

export default GlitchText;
