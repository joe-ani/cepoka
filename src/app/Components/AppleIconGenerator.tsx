"use client";

import { useEffect, useRef } from 'react';

const AppleIconGenerator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 180;
    canvas.height = 180;

    // Draw white circle background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(90, 90, 90, 0, Math.PI * 2);
    ctx.fill();

    // Load and draw the logo
    const img = new Image();
    img.onload = () => {
      // Calculate dimensions to fit logo inside circle with padding
      const padding = 20;
      const maxSize = 180 - (padding * 2);
      
      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;
      
      // Calculate dimensions while maintaining aspect ratio
      let width, height;
      if (aspectRatio > 1) {
        width = maxSize;
        height = width / aspectRatio;
      } else {
        height = maxSize;
        width = height * aspectRatio;
      }
      
      // Center the image
      const x = (180 - width) / 2;
      const y = (180 - height) / 2;
      
      // Draw the image
      ctx.drawImage(img, x, y, width, height);
      
      // Convert to data URL and download
      const dataUrl = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'apple-icon.png';
      link.href = dataUrl;
      link.click();
    };
    
    img.src = '/logo.png';
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AppleIconGenerator;
