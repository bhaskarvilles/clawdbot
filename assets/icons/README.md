# Windows Icon Generation

The Windows `.ico` file needs to be generated from the PNG icon. You can use one of these methods:

## Option 1: Online Converter
1. Go to https://convertio.co/png-ico/ or https://www.icoconverter.com/
2. Upload `assets/icons/icon.png`
3. Download the generated `.ico` file
4. Save as `assets/icons/icon.ico`

## Option 2: ImageMagick (if installed)
```bash
convert assets/icons/icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icons/icon.ico
```

## Option 3: Use electron-icon-builder
```bash
npx electron-icon-builder --input=assets/icons/icon.png --output=assets/icons --flatten
```

Once you have the `.ico` file, the Windows build will work correctly.
