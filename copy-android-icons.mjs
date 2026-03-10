import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SOURCE_ICON = './public/icons/icon-512x512.png';
const ANDROID_RES = './android/app/src/main/res';

// Android icon sizes and their folder names
const androidIcons = [
    { folder: 'mipmap-mdpi', size: 48 },
    { folder: 'mipmap-hdpi', size: 72 },
    { folder: 'mipmap-xhdpi', size: 96 },
    { folder: 'mipmap-xxhdpi', size: 144 },
    { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function copyAndroidIcons() {
    console.log('Copying icons to Android project...');

    for (const { folder, size } of androidIcons) {
        const folderPath = path.join(ANDROID_RES, folder);

        // Regular icon
        await sharp(SOURCE_ICON)
            .resize(size, size)
            .png()
            .toFile(path.join(folderPath, 'ic_launcher.png'));

        // Round icon
        await sharp(SOURCE_ICON)
            .resize(size, size)
            .png()
            .toFile(path.join(folderPath, 'ic_launcher_round.png'));

        // Foreground for adaptive icons
        await sharp(SOURCE_ICON)
            .resize(size, size)
            .png()
            .toFile(path.join(folderPath, 'ic_launcher_foreground.png'));

        console.log(`✓ Generated ${folder} icons (${size}x${size})`);
    }

    console.log('\nAndroid icons copied successfully!');
}

copyAndroidIcons().catch(console.error);
