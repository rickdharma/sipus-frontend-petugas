import React from "react";
import logoImg from "../assets/logo.png";

/**
 * Logo Image SIPUS
 */
export function LogoImage({ size = 36, className = "", alt = "Logo SIPUS" }) {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={`rounded-xl object-cover shrink-0 shadow-2xs ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
export function LogoIcon({ size = 32, className = "", idPrefix = "sipus" }) {
  const bgGradId = `${idPrefix}-bg-grad`;
  const pageGradL = `${idPrefix}-page-l`;
  const pageGradR = `${idPrefix}-page-r`;
  const ribbonGrad = `${idPrefix}-ribbon`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Logo SIPUS"
    >
      <defs>
        {/* Gradien Container Squircle */}
        <linearGradient id={bgGradId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Gradien Halaman Kiri (Lembut & Elegan) */}
        <linearGradient id={pageGradL} x1="8" y1="12" x2="20" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.85" />
        </linearGradient>

        {/* Gradien Halaman Kanan (Sedikit Lebih Terang) */}
        <linearGradient id={pageGradR} x1="20" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>

        {/* Gradien Pita Pembatas Buku (Aksen Sky / Cyan yang Hidup & Segar) */}
        <linearGradient id={ribbonGrad} x1="18.5" y1="8" x2="21.5" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Squircle Background dengan Radius Presisi & Border Halus */}
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        fill={`url(#${bgGradId})`}
      />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        stroke="#ffffff"
        strokeOpacity="0.12"
        strokeWidth="1"
      />

      {/* Lembar Halaman Kiri Buku (Lengkungan Geometris Mulus) */}
      <path
        d="M19 14.2C15.8 12.6 12.4 12.6 9.6 13.2C9.2 13.3 9 13.6 9 14V25.2C9 25.7 9.4 26 9.8 25.9C12.4 25.4 15.6 25.4 19 26.8V14.2Z"
        fill={`url(#${pageGradL})`}
      />

      {/* Lembar Halaman Kanan Buku (Simetris dengan Refleksi Cahaya) */}
      <path
        d="M21 14.2C24.2 12.6 27.6 12.6 30.4 13.2C30.8 13.3 31 13.6 31 14V25.2C31 25.7 30.6 26 30.2 25.9C27.6 25.4 24.4 25.4 21 26.8V14.2Z"
        fill={`url(#${pageGradR})`}
      />

      {/* Garis Aksen Lipatan Halaman Kiri */}
      <path
        d="M11.5 17.5C13.8 17.1 16.2 17.2 18.5 18"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M11.5 21C13.8 20.6 16.2 20.7 18.5 21.5"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      {/* Garis Aksen Lipatan Halaman Kanan */}
      <path
        d="M28.5 17.5C26.2 17.1 23.8 17.2 21.5 18"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <path
        d="M28.5 21C26.2 20.6 23.8 20.7 21.5 21.5"
        stroke="#818cf8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      {/* Pita Pembatas Buku Tengah (Bookmark Ribbon) */}
      <path
        d="M18.8 10C18.8 9.5 19.3 9 19.8 9H20.2C20.7 9 21.2 9.5 21.2 10V18.2L20 17L18.8 18.2V10Z"
        fill={`url(#${ribbonGrad})`}
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "full",
  theme = "light",
  className = "",
  useImage = true,
  idPrefix = "logo",
}) {
  const sizeMap = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };

  const iconPx = typeof size === "number" ? size : sizeMap[size] || 36;

  const isDark = theme === "dark";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {useImage ? (
        <LogoImage size={iconPx} />
      ) : (
        <LogoIcon size={iconPx} idPrefix={idPrefix} />
      )}

      {variant !== "icon" && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight leading-none ${
                iconPx >= 44 ? "text-2xl" : iconPx >= 36 ? "text-lg" : "text-base"
              } ${isDark ? "text-white" : "text-slate-900"}`}
            >
              SIPUS
            </span>
            <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 uppercase leading-none border border-indigo-400/20">
              Staff
            </span>
          </div>
          {variant === "full" && (
            <span
              className={`text-xs font-medium leading-tight mt-0.5 ${
                isDark ? "text-indigo-200" : "text-slate-500"
              }`}
            >
              Portal Petugas Perpustakaan
            </span>
          )}
        </div>
      )}
    </div>
  );
}
