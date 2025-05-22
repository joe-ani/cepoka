// Simple script to create a favicon.ico file from sitelogo.png
// Run with Node.js: node scripts/create-simple-favicon.js

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Paths
const sourceLogoPath = path.join(__dirname, '../public/icons/sitelogo.png');
const outputPath = path.join(__dirname, '../public/favicon.ico');

// Function to create a simple favicon
async function createSimpleFavicon() {
  try {
    // Create a canvas for the favicon (32x32 is standard size)
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 32, 32);
    
    // Load the logo image
    const logo = await loadImage(sourceLogoPath);
    
    // Calculate dimensions to center the logo
    const size = 24; // 75% of the favicon size
    const x = (32 - size) / 2;
    const y = (32 - size) / 2;
    
    // Draw the logo
    ctx.drawImage(logo, x, y, size, size);
    
    // Save as PNG (since canvas doesn't directly support ICO format)
    // You'll need to manually convert this to ICO format
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Created favicon at ${outputPath}`);
    console.log('Note: This is saved as a PNG file. You may need to rename it to .ico or convert it using an online converter.');
  } catch (error) {
    console.error('Error creating favicon:', error);
  }
}

// Run the function
createSimpleFavicon();
