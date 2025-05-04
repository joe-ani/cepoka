// This is a Node.js script to generate a favicon with a circular white background
// You would need to run this with Node.js and have the canvas package installed
// npm install canvas

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  // Create a canvas with the desired size
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw white circular background
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();

  // Load and draw the logo
  try {
    const logo = await loadImage(path.join(__dirname, 'logo.png'));
    
    // Calculate dimensions to maintain aspect ratio
    const logoSize = size * 0.6; // 60% of the canvas size
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    
    // Save the result
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, 'favicon.png'), buffer);
    
    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
