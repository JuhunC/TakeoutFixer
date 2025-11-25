# Takeout Fixer

A Visual Studio Code extension that processes Google Takeout data and applies metadata to media files.

## Features

- **Automatic Metadata Detection**: Scans Google Takeout folders for media files and their corresponding `.json` or `.supplemental-metadata.json` files
- **EXIF Data Application**: Applies metadata from JSON files to the actual media files including:
  - Date/Time (PhotoTakenTime, CreationTime)
  - GPS coordinates (latitude, longitude, altitude)
  - Title and Description
  - People tags (as keywords)
- **Flexible Organization**: 
  - Option to organize files by date (YYYY/MM folder structure)
  - Preserve original files or process in-place
  - Custom output folder support

## Usage

### Commands

The extension provides three commands accessible via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

1. **Takeout Fixer: Process Google Takeout Files**
   - Processes the `Takeout` folder in your current workspace
   
2. **Takeout Fixer: Select Takeout Folder**
   - Opens a dialog to select a custom Takeout folder location
   
3. **Takeout Fixer: Process Current Folder**
   - Processes the Takeout folder in the current workspace root

### Settings

Configure the extension behavior in VS Code settings:

- `takeoutFixer.outputFolder`: Output folder for processed files (leave empty to use default `ProcessedPhotos` folder)
- `takeoutFixer.preserveOriginals`: Keep original files when processing (default: `true`)
- `takeoutFixer.organizeByDate`: Organize files into folders by date in YYYY/MM format (default: `false`)

### Example Workflow

1. Extract your Google Takeout archive to a folder named `Takeout` in your workspace
2. Open the workspace in VS Code
3. Press `Ctrl+Shift+P` and run **Takeout Fixer: Process Google Takeout Files**
4. Wait for the processing to complete
5. Find your processed files in the `ProcessedPhotos` folder (or your custom output folder)

## How It Works

Google Takeout exports your photos with separate JSON metadata files. This extension:

1. Scans the Takeout directory recursively for media files (`.jpg`, `.jpeg`, `.png`, `.gif`, `.mp4`, `.mov`, `.avi`, `.heic`, `.webp`)
2. Finds corresponding metadata files (`.json` or `.supplemental-metadata.json`)
3. Reads the metadata including:
   - Photo taken time
   - GPS location data
   - Title and description
   - People in the photo
4. Applies this metadata directly to the media file's EXIF data using ExifTool
5. Optionally organizes files by date into year/month folders

## Requirements

- Visual Studio Code 1.85.0 or higher
- Node.js (for development)

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to open a new VS Code window with the extension loaded
4. Run the extension commands from the Command Palette

### Building VSIX Package

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the `.vsix` file in VS Code.

## Development

### Setup

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Watch Mode

```bash
npm run watch
```

### Run Extension

Press `F5` in VS Code to start debugging.

## Supported Metadata Fields

The extension reads and applies the following metadata from Google Takeout JSON files:

- `photoTakenTime.timestamp` → EXIF DateTimeOriginal, CreateDate
- `creationTime.timestamp` → EXIF DateTimeOriginal, CreateDate (fallback)
- `geoData.latitude/longitude` → EXIF GPS coordinates
- `geoDataExif.latitude/longitude` → EXIF GPS coordinates (preferred)
- `geoData.altitude` → EXIF GPS altitude
- `title` → EXIF Title, ImageDescription
- `description` → EXIF Description, UserComment
- `people[].name` → EXIF Keywords, PersonInImage

## Known Limitations

- Large Takeout archives may take significant time to process
- Some video formats may have limited metadata support
- Requires sufficient disk space for output files when preserving originals

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Credits

This extension uses [exiftool-vendored](https://github.com/photostructure/exiftool-vendored.js) for metadata manipulation.
