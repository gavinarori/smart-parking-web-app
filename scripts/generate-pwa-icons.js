const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for PWA
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#3b82f6"/>
  <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.4}" rx="${size * 0.05}" fill="white"/>
  <rect x="${size * 0.3}" y="${size * 0.4}" width="${size * 0.1}" height="${size * 0.2}" fill="#3b82f6"/>
  <rect x="${size * 0.6}" y="${size * 0.4}" width="${size * 0.1}" height="${size * 0.2}" fill="#3b82f6"/>
  <rect x="${size * 0.25}" y="${size * 0.7}" width="${size * 0.5}" height="${size * 0.15}" rx="${size * 0.02}" fill="white"/>
</svg>`;

// Icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated ${filePath}`);
});

console.log('PWA icons generated successfully!');
console.log('Note: For production, you should convert these SVG files to PNG format.');
