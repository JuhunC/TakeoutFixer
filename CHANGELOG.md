# Change Log

All notable changes to the "Takeout Fixer" extension will be documented in this file.

## [0.0.2] - 2025-11-25

### Added - Major UI Update
- **Modern Web UI**: Beautiful gradient-based interface with glassmorphism effects
- **Real-Time Progress Tracking**: Live progress bar and statistics (Total, Processed, Success, Errors)
- **Activity Log**: Terminal-style log with color-coded entries (Info, Success, Warning, Error)
- **Error Tracking**: Dedicated "Unhandled Cases" section showing failed files and reasons
- **Folder Selection**: Easy browse buttons for source and output folders
- **Visual Options**: Checkbox controls for preserve originals and organize by date
- **Status Indicators**: Idle, Processing, Complete, and Error states with visual badges
- **Auto-Scrolling Log**: Automatically shows latest activity
- **Duplicate Handling**: Automatically renames duplicate files in output
- New command: "Takeout Fixer: Open UI" (primary interface)
- All legacy commands now open the UI for consistency

### Changed
- UI is now the primary way to interact with the extension
- Progress updates batched every 10 files for better performance
- Error handling improved with detailed error messages per file

### Technical
- Added webview.ts for UI HTML/CSS/JavaScript
- Bidirectional messaging between extension and webview
- Retained context when webview is hidden
- Real-time statistics updates

## [0.0.1] - 2025-11-25

### Added
- Initial release of Takeout Fixer extension
- Process Google Takeout metadata files and apply to source media
- Support for images (JPG, PNG, GIF, HEIC, WebP) and videos (MP4, MOV, AVI)
- Three command options:
  - Process Google Takeout Files (workspace Takeout folder)
  - Select Takeout Folder (custom folder selection)
  - Process Current Folder (workspace root)
- Configuration options:
  - Custom output folder
  - Preserve originals toggle
  - Organize by date (YYYY/MM structure)
- Metadata support:
  - Date/Time (photoTakenTime, creationTime)
  - GPS coordinates (latitude, longitude, altitude)
  - Title and description
  - People tags (as keywords)
- Progress notification with cancellation support
- Comprehensive error handling and logging

### Features
- Recursive directory scanning
- Automatic metadata file detection (.json and .supplemental-metadata.json)
- EXIF data writing using exiftool-vendored
- Batch processing with progress tracking
- File organization by date (optional)

## [Unreleased]

### Planned Features
- Duplicate detection and handling
- Custom metadata field mapping
- Preview mode before processing
- Selective file processing (filter by date, type, etc.)
- Undo/rollback functionality
- Statistics and reporting
- Multi-language support for folder names
