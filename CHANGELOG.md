# Change Log

All notable changes to the "Takeout Fixer" extension will be documented in this file.

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
