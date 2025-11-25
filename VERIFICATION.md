# Extension Verification Checklist

## ✅ Pre-Flight Checklist

Run through this checklist before testing or publishing the extension:

### 1. File Structure
- [ ] `package.json` exists and is valid JSON
- [ ] `src/extension.ts` exists
- [ ] `out/extension.js` exists (compiled)
- [ ] `icon.png` exists
- [ ] `README.md` exists
- [ ] `LICENSE` exists
- [ ] `CHANGELOG.md` exists

### 2. Dependencies
- [ ] `node_modules` folder exists
- [ ] `exiftool-vendored` is installed
- [ ] All TypeScript types are installed

### 3. Compilation
- [ ] `npm run compile` succeeds without errors
- [ ] `out/extension.js` is generated
- [ ] No TypeScript errors

### 4. Extension Manifest (package.json)
- [ ] Name is set
- [ ] Display name is set
- [ ] Description is set
- [ ] Version is set
- [ ] Icon path is correct
- [ ] All three commands are defined
- [ ] Configuration properties are defined
- [ ] Main entry point is correct (`./out/extension.js`)

### 5. Commands
- [ ] `takeout-fixer.processFiles`
- [ ] `takeout-fixer.selectTakeoutFolder`
- [ ] `takeout-fixer.processCurrentFolder`

### 6. Configuration Options
- [ ] `takeoutFixer.outputFolder`
- [ ] `takeoutFixer.preserveOriginals`
- [ ] `takeoutFixer.organizeByDate`

### 7. Testing
- [ ] Extension loads in Extension Development Host (F5)
- [ ] Commands appear in Command Palette
- [ ] Can select Takeout folder
- [ ] Progress notification appears
- [ ] Files are processed correctly
- [ ] Metadata is applied to output files
- [ ] Error handling works

### 8. Documentation
- [ ] README is complete and accurate
- [ ] QUICKSTART guide is user-friendly
- [ ] SETUP instructions work on Windows
- [ ] CHANGELOG is up to date

## 🧪 Quick Test Commands

### Verify Compilation
```bash
npm run compile
```

### Check for TypeScript Errors
```bash
npx tsc --noEmit
```

### Lint Code
```bash
npm run lint
```

### Package Extension
```bash
npx @vscode/vsce package
```

## 🔍 Manual Testing Steps

1. **Load Extension**
   - Press F5 in VS Code
   - New Extension Development Host window opens

2. **Test Command Palette**
   - Press Ctrl+Shift+P
   - Type "Takeout"
   - Verify all three commands appear

3. **Test Folder Selection**
   - Run "Select Takeout Folder" command
   - Verify folder picker opens
   - Select a test folder

4. **Test Processing**
   - Create a test Takeout folder structure:
     ```
     Takeout/
     └── Google Photos/
         └── Test/
             ├── test.jpg
             └── test.jpg.json
     ```
   - Run "Process Google Takeout Files"
   - Verify progress notification appears
   - Check ProcessedPhotos folder for output

5. **Test Configuration**
   - Open VS Code settings
   - Search for "takeout"
   - Verify all three settings appear
   - Change settings and test behavior

6. **Test Error Handling**
   - Try processing with no Takeout folder
   - Try processing with invalid JSON
   - Verify error messages are shown

## 🐛 Common Issues and Solutions

### Issue: "Cannot find module 'vscode'"
**Solution**: Run `npm install`

### Issue: "npm command not found" or PowerShell error
**Solution**: Use `cmd /c npm install` or see SETUP.md

### Issue: Extension doesn't load
**Solution**: 
- Check `out/extension.js` exists
- Run `npm run compile`
- Check for TypeScript errors

### Issue: ExifTool errors
**Solution**: 
- Check file permissions
- Verify antivirus isn't blocking ExifTool
- Check that media files are valid

### Issue: No metadata applied
**Solution**:
- Verify JSON files exist alongside media files
- Check JSON file format matches Google Takeout structure
- Look at console output for errors

## 📊 Success Criteria

Extension is ready when:
- ✅ All files compile without errors
- ✅ Extension loads in development host
- ✅ All commands work as expected
- ✅ Metadata is correctly applied to test files
- ✅ Progress tracking works
- ✅ Error messages are clear and helpful
- ✅ Documentation is complete
- ✅ VSIX package can be created

## 🚀 Publishing Checklist

Before publishing to VS Code Marketplace:
- [ ] Update version number in package.json
- [ ] Update CHANGELOG.md
- [ ] Test on clean installation
- [ ] Create GitHub repository
- [ ] Update repository URL in package.json
- [ ] Add screenshots to README
- [ ] Create publisher account
- [ ] Generate personal access token
- [ ] Run `vsce publish`

---

**Last Updated**: November 25, 2025
