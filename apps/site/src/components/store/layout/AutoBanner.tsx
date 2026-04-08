'use client';

import { useEffect, useState, useRef } from 'react';

const BANNERS = [
  "https://cdn.awsli.com.br/1920x1920/1940/1940182/banner/banner-principal-v1-1gvijhaxt3.png",
  "https://cdn.awsli.com.br/1920x1920/1940/1940182/banner/b2-n779o3pmx2.jpg"
];

export function AutoBanner() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % BANNERS.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  }, [index]);

  return (
    <section style={{ width: '100%', maxWidth: '1200px', margin: '40px auto 0', padding: '0 16px' }}>
      <div style={{ 
        width: '100%', 
        overflow: 'hidden', 
        borderRadius: '16px',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        background: '#0a0a0a',
        position: 'relative'
      }}>
        <div ref={scrollRef} style={{ 
          display: 'flex', 
          width: '100%', 
          overflowX: 'hidden',
          scrollBehavior: 'smooth'
        }}>
          {BANNERS.map((url, i) => (
            <div key={i} style={{ minWidth: '100%', flexShrink: 0, display: 'flex' }}>
              <img 
                src={url} 
                alt={`Banner ${i + 1}`} 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block' 
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
