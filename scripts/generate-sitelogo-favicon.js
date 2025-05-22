// This script generates favicon files from the sitelogo.png with a white circular background
// Run with Node.js: node scripts/generate-sitelogo-favicon.js

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Paths
const sourceLogoPath = path.join(__dirname, '../public/icons/sitelogo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to create a circular favicon with white background
async function createCircularFavicon(size, outputFilename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw white circular background
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Add subtle shadow (optional)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Load and draw the logo
  try {
    const logo = await loadImage(sourceLogoPath);
    
    // Calculate dimensions to maintain aspect ratio
    const logoSize = size * 0.7; // Logo takes up 70% of the favicon
    const x = (size - logoSize) / 2;
    const y = (size - logoSize) / 2;
    
    // Draw the logo
    ctx.drawImage(logo, x, y, logoSize, logoSize);
    
    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, outputFilename), buffer);
    
    console.log(`Created ${outputFilename}`);
  } catch (error) {
    console.error(`Error creating ${outputFilename}:`, error);
  }
}

// Generate favicons in different sizes
async function generateFavicons() {
  try {
    await createCircularFavicon(16, 'sitelogo-favicon-16x16.png');
    await createCircularFavicon(32, 'sitelogo-favicon-32x32.png');
    await createCircularFavicon(192, 'sitelogo-favicon-192x192.png');
    await createCircularFavicon(512, 'sitelogo-favicon-512x512.png');
    await createCircularFavicon(180, 'sitelogo-apple-touch-icon.png');
    
    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Run the generator
generateFavicons();
