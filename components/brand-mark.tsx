import React from "react";

interface BrandMarkProps {
  className?: string;
  size?: number;
}

export function BrandMark({ className = "w-8 h-8", size }: BrandMarkProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#1D4ED8] p-2 text-white shadow-sm transition-transform hover:scale-105 ${className}`}
      style={style}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        {/* Document base */}
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        {/* Navigation paper plane / compass wing */}
        <path d="m10 13 4-2-2 4-1-1-1-1z" fill="white" stroke="none" />
        <path d="m9 14 6-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-navy-800 ${className}`}>
      <BrandMark className="w-8 h-8" />
      <div className="flex flex-col">
        <span className="text-lg leading-tight font-extrabold text-navy-800">
          Paper<span className="text-primary">Pilot</span>
        </span>
        <span className="text-[10px] font-medium tracking-wider text-muted uppercase">
          Document Intelligence
        </span>
      </div>
    </div>
  );
}
