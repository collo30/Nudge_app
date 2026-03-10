import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_IMAGE = 'C:/Users/User/.gemini/antigravity/brain/354c7e61-15e0-4500-bcb0-627fb784510d/pocket_budget_icon_transparent_1768860111844.png';
const OUTPUT_DIR = './public/icons';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIconWithWhiteBg(size, outputPath) {
    // Step 1: Resize wallet to fit the target size with padding
    const resizedWallet = await sharp(SOURCE_IMAGE)
        .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .toBuffer();

    // Step 2: Flatten the transparent image onto solid white and save
    await sharp(resizedWallet)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .toFormat('png')
        .toFile(outputPath);
}

async function generateIcons() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('🔨 Generating cute brown wallet icons with WHITE background...\n');

    for (const size of sizes) {
        const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
        await generateIconWithWhiteBg(size, outputPath);
        console.log(`  ✓ Generated icons/${size}x${size}.png`);
    }

    // Also generate main icons in public root
    await generateIconWithWhiteBg(192, './public/icon-192x192.png');
    console.log('  ✓ Generated public/icon-192x192.png');

    await generateIconWithWhiteBg(512, './public/icon-512x512.png');
    console.log('  ✓ Generated public/icon-512x512.png');

    // Also generate favicon
    await generateIconWithWhiteBg(32, './public/favicon.png');
    console.log('  ✓ Generated public/favicon.png');

    console.log('\n✅ All icons generated successfully!');
    console.log('   Icon: Cute brown wallet with money and coins');
    console.log('   Background: Solid white (#FFFFFF)');
}

generateIcons().catch(console.error);
