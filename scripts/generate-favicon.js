const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths
const sourceLogoPath = path.join(__dirname, '../public/icons/sitelogo.png');
const outputDir = path.join(__dirname, '../public');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to create a circular favicon with white background
async function createCircularFavicon(size) {
  const outputFilename = size === 512 ? 'favicon-512.png' : 'favicon.png';
  const outputPath = path.join(outputDir, outputFilename);
  
  try {
    // Create a white circular background
    const background = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );
    
    // Get the logo dimensions
    const logoMetadata = await sharp(sourceLogoPath).metadata();
    const logoAspectRatio = logoMetadata.width / logoMetadata.height;
    
    // Calculate dimensions to maintain aspect ratio
    let logoWidth, logoHeight;
    const padding = size * 0.2; // 20% padding
    const maxDimension = size - (padding * 2);
    
    if (logoAspectRatio > 1) {
      // Logo is wider than tall
      logoWidth = maxDimension;
      logoHeight = logoWidth / logoAspectRatio;
    } else {
      // Logo is taller than wide
      logoHeight = maxDimension;
      logoWidth = logoHeight * logoAspectRatio;
    }
    
    // Resize the logo
    const resizedLogo = await sharp(sourceLogoPath)
      .resize(Math.round(logoWidth), Math.round(logoHeight), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
    
    // Calculate position to center the logo
    const left = Math.round((size - logoWidth) / 2);
    const top = Math.round((size - logoHeight) / 2);
    
    // Composite the logo onto the circular background
    await sharp(background)
      .composite([
        {
          input: resizedLogo,
          left,
          top
        }
      ])
      .toFile(outputPath);
    
    console.log(`Created ${outputFilename} (${size}x${size})`);
  } catch (error) {
    console.error(`Error creating ${outputFilename}:`, error);
  }
}

// Function to create Apple icon
async function createAppleIcon() {
  const size = 180;
  const outputPath = path.join(outputDir, 'apple-icon.png');
  
  try {
    // Create a white circular background
    const background = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );
    
    // Get the logo dimensions
    const logoMetadata = await sharp(sourceLogoPath).metadata();
    const logoAspectRatio = logoMetadata.width / logoMetadata.height;
    
    // Calculate dimensions to maintain aspect ratio
    let logoWidth, logoHeight;
    const padding = size * 0.2; // 20% padding
    const maxDimension = size - (padding * 2);
    
    if (logoAspectRatio > 1) {
      // Logo is wider than tall
      logoWidth = maxDimension;
      logoHeight = logoWidth / logoAspectRatio;
    } else {
      // Logo is taller than wide
      logoHeight = maxDimension;
      logoWidth = logoHeight * logoAspectRatio;
    }
    
    // Resize the logo
    const resizedLogo = await sharp(sourceLogoPath)
      .resize(Math.round(logoWidth), Math.round(logoHeight), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
    
    // Calculate position to center the logo
    const left = Math.round((size - logoWidth) / 2);
    const top = Math.round((size - logoHeight) / 2);
    
    // Composite the logo onto the circular background
    await sharp(background)
      .composite([
        {
          input: resizedLogo,
          left,
          top
        }
      ])
      .toFile(outputPath);
    
    console.log(`Created apple-icon.png (${size}x${size})`);
  } catch (error) {
    console.error('Error creating apple-icon.png:', error);
  }
}

// Function to create splash screen
async function createSplashScreen() {
  const width = 1024;
  const height = 1024;
  const outputPath = path.join(outputDir, 'splash-screen.png');
  
  try {
    // Create a white background
    const background = Buffer.from(
      `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${width}" height="${height}" fill="white"/>
      </svg>`
    );
    
    // Get the logo dimensions
    const logoMetadata = await sharp(sourceLogoPath).metadata();
    const logoAspectRatio = logoMetadata.width / logoMetadata.height;
    
    // Calculate dimensions to maintain aspect ratio
    let logoWidth, logoHeight;
    const maxDimension = width * 0.6; // 60% of the width
    
    if (logoAspectRatio > 1) {
      // Logo is wider than tall
      logoWidth = maxDimension;
      logoHeight = logoWidth / logoAspectRatio;
    } else {
      // Logo is taller than wide
      logoHeight = maxDimension;
      logoWidth = logoHeight * logoAspectRatio;
    }
    
    // Resize the logo
    const resizedLogo = await sharp(sourceLogoPath)
      .resize(Math.round(logoWidth), Math.round(logoHeight), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();
    
    // Calculate position to center the logo
    const left = Math.round((width - logoWidth) / 2);
    const top = Math.round((height - logoHeight) / 2);
    
    // Composite the logo onto the background
    await sharp(background)
      .composite([
        {
          input: resizedLogo,
          left,
          top
        }
      ])
      .toFile(outputPath);
    
    console.log(`Created splash-screen.png (${width}x${height})`);
  } catch (error) {
    console.error('Error creating splash-screen.png:', error);
  }
}

// Generate all favicon files
async function generateFavicons() {
  await createCircularFavicon(192);
  await createCircularFavicon(512);
  await createAppleIcon();
  await createSplashScreen();
  console.log('All favicon files generated successfully!');
}

generateFavicons();
