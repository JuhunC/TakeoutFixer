# Quick Start Guide

## What This Extension Does

The **Takeout Fixer** extension helps you restore metadata to your Google Photos that were exported via Google Takeout. When you download your photos from Google Takeout, the metadata (date taken, GPS location, people tags, etc.) is stored in separate JSON files instead of being embedded in the photos themselves. This extension reads those JSON files and applies the metadata directly to your photos.

## How to Use

### Step 1: Get Your Google Takeout Data

1. Go to [Google Takeout](https://takeout.google.com/)
2. Select "Google Photos"
3. Download and extract the archive
4. You should have a folder structure like:
   ```
   Takeout/
   └── Google Photos/
       ├── 2024년의 사진/
       │   ├── photo1.jpg
       │   ├── photo1.jpg.json
       │   ├── photo2.jpg
       │   └── photo2.jpg.json
       └── ...
   ```

### Step 2: Open in VS Code

1. Open VS Code
2. Open the folder containing your `Takeout` folder as a workspace

### Step 3: Run the Extension

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Takeout Fixer"
3. Select **"Takeout Fixer: Process Google Takeout Files"**
4. Wait for processing to complete

### Step 4: Find Your Photos

Your processed photos will be in a new `ProcessedPhotos` folder with all metadata applied!

## What Metadata Gets Applied

The extension applies the following metadata from Google Takeout JSON files:

✅ **Date & Time** - When the photo was taken  
✅ **GPS Location** - Where the photo was taken (latitude, longitude, altitude)  
✅ **Title & Description** - Photo captions  
✅ **People Tags** - Names of people in the photo (as keywords)  

## Configuration Options

You can customize the extension behavior in VS Code settings:

### Organize by Date
```json
{
  "takeoutFixer.organizeByDate": true
}
```
This will organize your photos into folders like `2024/01/`, `2024/02/`, etc.

### Custom Output Folder
```json
{
  "takeoutFixer.outputFolder": "D:\\MyPhotos\\Restored"
}
```
Specify where you want the processed photos to be saved.

### Don't Keep Originals
```json
{
  "takeoutFixer.preserveOriginals": false
}
```
Move files instead of copying them (saves disk space).

## Tips

- **Large Libraries**: Processing thousands of photos may take a while. The extension shows progress in a notification.
- **Disk Space**: By default, original files are preserved. Make sure you have enough disk space.
- **Cancellation**: You can cancel the process at any time by clicking the cancel button in the progress notification.

## Example Workflow

1. Download Google Takeout archive
2. Extract to `D:\MyPhotos\Takeout`
3. Open `D:\MyPhotos` in VS Code
4. Run "Takeout Fixer: Process Google Takeout Files"
5. Wait for completion
6. Find processed photos in `D:\MyPhotos\ProcessedPhotos`
7. Import to your favorite photo management software (Lightroom, Photos, etc.)

## Troubleshooting

**Q: The extension can't find my Takeout folder**  
A: Make sure the folder is named exactly `Takeout` and is in your workspace root. Alternatively, use "Select Takeout Folder" command to choose a custom location.

**Q: Some photos don't have metadata applied**  
A: The extension only processes photos that have corresponding `.json` metadata files. If Google Takeout didn't include metadata for a photo, it will be skipped.

**Q: The process is taking a long time**  
A: Processing thousands of photos with metadata can take time. Each photo needs to be read, have its EXIF data modified, and written back to disk.

## Next Steps

After processing, you can:
- Import photos into your photo management software
- Upload to cloud storage with proper metadata
- Share photos with correct dates and locations
- Delete the original Takeout folder to save space
