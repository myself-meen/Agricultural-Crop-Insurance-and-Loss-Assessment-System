import React from 'react';

const icon = (path, viewBox = '0 0 24 24') =>
  ({ size = 24, color = 'currentColor', style = {} }) => (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      {path.split('|').map((d, i) => <path key={i} d={d} />)}
    </svg>
  );

export const LayoutDashboard = icon('M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z');
export const Users = icon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75');
export const User = icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z');
export const FileText = icon('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z|M14 2v6h6|M16 13H8|M16 17H8|M10 9H8');
export const AlertTriangle = icon('M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z|M12 9v4|M12 17h.01');
export const AlertCircle = icon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z|M12 8v4|M12 16h.01');
export const ClipboardCheck = icon('M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2|M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2|M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2|M9 14l2 2 4-4');
export const BarChart3 = icon('M18 20V10|M12 20V4|M6 20v-6');
export const Settings = icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z');
export const LogOut = icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9');
export const Menu = icon('M3 12h18|M3 6h18|M3 18h18');
export const X = icon('M18 6L6 18|M6 6l12 12');
export const Bell = icon('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9|M13.73 21a2 2 0 0 1-3.46 0');
export const ChevronRight = icon('M9 18l6-6-6-6');
export const Wheat = icon('M2 22 16 8|M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z|M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z|M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z|M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4z|M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0z|M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0z|M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0z');
export const Shield = icon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
export const ShieldCheck = icon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z|M9 12l2 2 4-4');
export const MapPin = icon('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z');
export const TrendingUp = icon('M23 6l-9.5 9.5-5-5L1 18|M17 6h6v6');
export const TrendingDown = icon('M23 18l-9.5-9.5-5 5L1 6|M17 18h6v-6');
export const IndianRupee = icon('M6 3h12|M6 8h12|M6 13l8.5 8|M6 13h3a4 4 0 0 0 0-8');
export const Clock = icon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z|M12 6v6l4 2');
export const CheckCircle = icon('M22 11.08V12a10 10 0 1 1-5.93-9.14|M22 4L12 14.01l-3-3');
export const XCircle = icon('M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z|M15 9l-6 6|M9 9l6 6');
export const ArrowRight = icon('M5 12h14|M12 5l7 7-7 7');
export const Eye = icon('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z|M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z');
export const EyeOff = icon('M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24|M1 1l22 22');
export const Calendar = icon('M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z|M16 2v4|M8 2v4|M3 10h18');
export const Upload = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12');
export const Camera = icon('M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z|M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z');
export const CloudRain = icon('M16 13v8|M8 13v8|M12 15v8|M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25');
export const Activity = icon('M22 12h-4l-3 9L9 3l-3 9H2');
export const Plus = icon('M12 5v14|M5 12h14');
export const Search = icon('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.35-4.35');
export const ToggleLeft = icon('M21 12a4 4 0 0 1-4 4H7a4 4 0 0 1 0-8h10a4 4 0 0 1 4 4z|M8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z');
export const ToggleRight = icon('M21 12a4 4 0 0 1-4 4H7a4 4 0 0 1 0-8h10a4 4 0 0 1 4 4z|M16 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2z');
export const Download = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3');
export const Filter = icon('M22 3H2l8 9.46V19l4 2V12.46L22 3z');
export const Landmark = icon('M3 22h18|M6 18V9|M10 18V9|M14 18V9|M18 18V9|M12 2L2 7h20L12 2z');
export const Star = ({ size = 24, color = 'currentColor', fill, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', flexShrink: 0, ...style }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
export const RefreshCw = icon('M23 4v6h-6|M1 20v-6h6|M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15');
export const Edit3 = icon('M12 20h9|M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z');
export const Save = icon('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z|M17 21v-8H7v8|M7 3v5h8');

