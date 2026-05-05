'use client';

import { BannerCarousel } from '@/components/store/ui/BannerCarousel';

const slides = [
  { src: '/banner1-seven.webp', alt: 'Banner Seven Sim Racing 1', href: '/seven/produtos' },
  { src: '/banner2-seven.webp', alt: 'Banner Seven Sim Racing 2', href: '/seven/produtos' },
];

export function HeroCarousel() {
  return <BannerCarousel slides={slides} accentColor="#ea580c" />;
}
