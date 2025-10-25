import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateSummaryImage = async (data) => {
  const { totalCountries, topCountries, lastRefreshed } = data;

  // Create canvas
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1e3a8a');
  gradient.addColorStop(1, '#3b82f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Country Data Summary', width / 2, 60);

  // Total countries
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`Total Countries: ${totalCountries}`, width / 2, 120);

  // Top 5 countries header
  ctx.font = 'bold 24px Arial';
  ctx.fillText('Top 5 Countries by GDP', width / 2, 180);

  // Top countries list
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  let yPosition = 230;
  
  topCountries.forEach((country, index) => {
    const gdpFormatted = country.estimated_gdp 
      ? `$${parseFloat(country.estimated_gdp).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
      : 'N/A';
    
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${index + 1}.`, 100, yPosition);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(country.name, 140, yPosition);
    
    ctx.fillStyle = '#86efac';
    ctx.textAlign = 'right';
    ctx.fillText(gdpFormatted, width - 100, yPosition);
    ctx.textAlign = 'left';
    
    yPosition += 50;
  });

  // Timestamp
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  const timestamp = lastRefreshed 
    ? new Date(lastRefreshed).toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })
    : 'Not available';
  ctx.fillText(`Last Refreshed: ${timestamp}`, width / 2, height - 40);

  // Save image
  const cacheDir = path.join(__dirname, '../../cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const imagePath = path.join(cacheDir, 'summary.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);

  return imagePath;
};