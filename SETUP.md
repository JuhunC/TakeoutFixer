# Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- Visual Studio Code

## Installation Steps

### 1. Install Dependencies

Due to PowerShell execution policy restrictions, you may need to run the installation in a different way:

**Option A: Use Command Prompt (cmd.exe)**
```cmd
npm install
```

**Option B: Temporarily bypass PowerShell restriction**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

**Option C: Use Git Bash or WSL**
```bash
npm install
```

### 2. Compile the Extension

```bash
npm run compile
```

### 3. Run the Extension

1. Open this folder in VS Code
2. Press `F5` to start debugging
3. A new VS Code window will open with the extension loaded

### 4. Test the Extension

In the new VS Code window:
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type "Takeout Fixer"
3. Select one of the commands:
   - **Process Google Takeout Files** - Process the Takeout folder in workspace
   - **Select Takeout Folder** - Choose a custom Takeout folder
   - **Process Current Folder** - Process workspace Takeout folder

## Building a VSIX Package

To create an installable `.vsix` file:

```bash
npm install -g @vscode/vsce
vsce package
```

This will create a `takeout-fixer-0.0.1.vsix` file that can be installed in VS Code.

## Troubleshooting

### PowerShell Execution Policy Error

If you see an error about scripts being disabled, you have several options:

1. **Use Command Prompt instead of PowerShell**
2. **Run as Administrator and change policy:**
   ```powershell
   Set-ExecutionPolicy RemoteSigned
   ```
3. **Use the VS Code integrated terminal with Git Bash**

### Module Not Found Errors

These are expected before running `npm install`. The TypeScript compiler will show errors until dependencies are installed.

### ExifTool Issues

The `exiftool-vendored` package includes a bundled version of ExifTool. If you encounter issues:
- Make sure you have sufficient permissions to execute binaries
- Check that your antivirus isn't blocking the ExifTool executable

## Development Workflow

1. **Watch Mode**: Run `npm run watch` to automatically recompile on changes
2. **Debugging**: Press `F5` to launch the extension in debug mode
3. **Reload**: After making changes, reload the extension host window (`Ctrl+R`)

## Configuration

You can configure the extension in VS Code settings:

```json
{
  "takeoutFixer.outputFolder": "D:\\ProcessedPhotos",
  "takeoutFixer.preserveOriginals": true,
  "takeoutFixer.organizeByDate": true
}
```
