# Takeout Fixer - VS Code Extension

## 🎯 Project Overview

**Takeout Fixer** is a Visual Studio Code extension that solves a common problem with Google Takeout exports: metadata stored in separate JSON files instead of embedded in the media files themselves. This extension automatically reads those JSON files and applies the metadata (dates, GPS coordinates, people tags, etc.) directly to your photos and videos.

## 📁 Project Structure

```
TakeoutFixer/
├── .vscode/              # VS Code configuration
│   ├── launch.json       # Debug configuration
│   └── tasks.json        # Build tasks
├── src/                  # Source code
│   └── extension.ts      # Main extension logic
├── out/                  # Compiled JavaScript (generated)
│   ├── extension.js
│   └── extension.js.map
├── node_modules/         # Dependencies (generated)
├── Takeout/             # Your Google Takeout data (gitignored)
├── ProcessedPhotos/     # Output folder (gitignored)
├── .eslintrc.js         # ESLint configuration
├── .gitignore           # Git ignore rules
├── .vscodeignore        # VS Code extension package ignore
├── CHANGELOG.md         # Version history
├── LICENSE              # MIT License
├── package.json         # Extension manifest
├── QUICKSTART.md        # User guide
├── README.md            # Main documentation
├── SETUP.md             # Development setup instructions
├── tsconfig.json        # TypeScript configuration
└── icon.png             # Extension icon
```

## 🚀 Features

### Core Functionality
- ✅ **Automatic Metadata Detection** - Scans for `.json` and `.supplemental-metadata.json` files
- ✅ **EXIF Data Application** - Writes metadata directly to media files
- ✅ **Batch Processing** - Handles thousands of files with progress tracking
- ✅ **Flexible Organization** - Optional date-based folder structure (YYYY/MM)
- ✅ **Safe Processing** - Preserves originals by default

### Supported Metadata
- 📅 **Date/Time** - Photo taken time, creation time
- 📍 **GPS Location** - Latitude, longitude, altitude
- 🏷️ **Title & Description** - Photo captions and descriptions
- 👥 **People Tags** - Names of people in photos (as keywords)

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, HEIC, WebP
- **Videos**: MP4, MOV, AVI

## 🛠️ Technical Stack

- **Language**: TypeScript
- **Platform**: VS Code Extension API
- **Metadata Tool**: exiftool-vendored (includes bundled ExifTool)
- **Build System**: TypeScript Compiler (tsc)
- **Linting**: ESLint with TypeScript support

## 📦 Commands

The extension provides three commands accessible via Command Palette (`Ctrl+Shift+P`):

1. **Takeout Fixer: Process Google Takeout Files**
   - Processes the `Takeout` folder in current workspace
   
2. **Takeout Fixer: Select Takeout Folder**
   - Opens dialog to select custom Takeout folder
   
3. **Takeout Fixer: Process Current Folder**
   - Processes workspace root Takeout folder

## ⚙️ Configuration

Settings available in VS Code preferences:

```json
{
  "takeoutFixer.outputFolder": "",           // Custom output path
  "takeoutFixer.preserveOriginals": true,    // Keep original files
  "takeoutFixer.organizeByDate": false       // Organize by YYYY/MM
}
```

## 🔧 Development

### Prerequisites
- Node.js v18+
- Visual Studio Code
- Git (optional)

### Setup
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile on changes)
npm run watch
```

### Running the Extension
1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test commands in the new window

### Building VSIX Package
```bash
npm install -g @vscode/vsce
vsce package
```

This creates `takeout-fixer-0.0.1.vsix` for distribution.

## 📖 Documentation

- **[README.md](README.md)** - Main documentation with features and usage
- **[QUICKSTART.md](QUICKSTART.md)** - User-friendly getting started guide
- **[SETUP.md](SETUP.md)** - Development setup with Windows-specific notes
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and planned features

## 🔍 How It Works

1. **Scan**: Recursively searches for media files in Takeout directory
2. **Match**: Finds corresponding `.json` metadata files for each media file
3. **Parse**: Reads metadata from JSON (dates, GPS, people, etc.)
4. **Apply**: Uses ExifTool to write metadata to media file's EXIF data
5. **Organize**: Optionally organizes files by date into YYYY/MM folders
6. **Report**: Shows progress and completion statistics

## 🎨 Extension Icon

The extension includes a custom-generated icon featuring a photo symbol with metadata/repair elements, using a blue-to-purple gradient for a modern, professional look.

## 📝 Google Takeout JSON Structure

The extension reads the following fields from Google Takeout metadata files:

```json
{
  "title": "Photo title",
  "description": "Photo description",
  "photoTakenTime": {
    "timestamp": "1234567890",
    "formatted": "Jan 1, 2024, 12:00:00 AM UTC"
  },
  "geoData": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 10.0
  },
  "people": [
    { "name": "Person Name" }
  ]
}
```

## 🚧 Known Limitations

- Large archives (10,000+ files) may take significant time to process
- Some video formats have limited metadata support
- Requires sufficient disk space when preserving originals
- Windows PowerShell execution policy may require workaround for npm commands

## 🔮 Future Enhancements

- Duplicate detection and handling
- Custom metadata field mapping
- Preview mode before processing
- Selective file filtering (by date, type, etc.)
- Undo/rollback functionality
- Processing statistics and reports
- Multi-language support for folder names

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💡 Use Cases

1. **Photo Library Migration** - Restore metadata before importing to new photo management software
2. **Cloud Backup** - Upload photos with proper dates and locations
3. **Photo Sharing** - Share photos with friends/family with correct metadata
4. **Archive Organization** - Organize years of photos by actual date taken
5. **Privacy Control** - Selectively apply or remove GPS data

## 🎓 Learning Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [ExifTool Documentation](https://exiftool.org/)
- [Google Takeout](https://takeout.google.com/)

---

**Created**: November 25, 2025  
**Version**: 0.0.1  
**Status**: Ready for testing and development
