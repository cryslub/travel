import { SVGProps } from 'react';

const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  width: 20,
  height: 20,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function FlightIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>;
}
export function TrainIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><rect x="4" y="3" width="16" height="16" rx="3"/><circle cx="8" cy="15" r="1.2" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1.2" fill="currentColor" stroke="none"/><path d="M4 12h16M7 19l-2 3M17 19l2 3"/></svg>;
}
export function BusIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><rect x="4" y="4" width="16" height="13" rx="2"/><circle cx="8" cy="17" r="1.4" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="1.4" fill="currentColor" stroke="none"/><path d="M4 10h16"/></svg>;
}
export function CarIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M5 16l1.5-5a2 2 0 012-1.5h7a2 2 0 012 1.5L19 16M4 16h16v3H4z"/><circle cx="7.5" cy="17" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="17" r="1.2" fill="currentColor" stroke="none"/></svg>;
}
export function FerryIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M3 18s2 1 4 0 4-2 5-1 3 1 5 0 4-1 4-1M5 16l2-7h10l2 7M12 3v6"/></svg>;
}
export function MovingIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M3 17c4-8 10-8 14 0"/><path d="M14 9l3-3 3 3"/></svg>;
}
export function LocationIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
}
export function RestaurantIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M7 2v9a2 2 0 002 2v9M5 2v5a2 2 0 002 2M9 2v5M17 13c0 1 0 8 0 9M17 2a3 3 0 00-3 3v5a3 3 0 003 3z"/></svg>;
}
export function TourIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M5 4v16l4-3 3 3 3-3 4 3V4z"/></svg>;
}
export function LocalActivityIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><rect x="3" y="9" width="18" height="11" rx="2"/><path d="M3 13h18M9 9V5a2 2 0 014 0v4"/></svg>;
}
export function SmartDisplayIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><rect x="3" y="7" width="15" height="10" rx="1.5"/><path d="M18 10l3-1.5v7L18 14"/></svg>;
}
export function ArticleIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7M9 8h4"/></svg>;
}
export function NoteIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
}
export function HotelIcon(props: SVGProps<SVGSVGElement>) {
  return <svg {...iconProps} {...props}><path d="M7 13a3 3 0 100-6 3 3 0 000 6z"/><path d="M19 7h-8v8H3V5M1 20h22"/></svg>;
}
