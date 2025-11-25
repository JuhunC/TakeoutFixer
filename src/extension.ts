import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExifTool } from 'exiftool-vendored';

interface TakeoutMetadata {
    title?: string;
    description?: string;
    imageViews?: string;
    creationTime?: {
        timestamp?: string;
        formatted?: string;
    };
    photoTakenTime?: {
        timestamp?: string;
        formatted?: string;
    };
    geoData?: {
        latitude?: number;
        longitude?: number;
        altitude?: number;
        latitudeSpan?: number;
        longitudeSpan?: number;
    };
    geoDataExif?: {
        latitude?: number;
        longitude?: number;
        altitude?: number;
        latitudeSpan?: number;
        longitudeSpan?: number;
    };
    people?: Array<{ name: string }>;
    url?: string;
    googlePhotosOrigin?: {
        mobileUpload?: {
            deviceFolder?: {
                localFolderName?: string;
            };
            deviceType?: string;
        };
    };
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Takeout Fixer extension is now active!');

    // Register commands
    let processFilesCommand = vscode.commands.registerCommand('takeout-fixer.processFiles', async () => {
        await processGoogleTakeout();
    });

    let selectFolderCommand = vscode.commands.registerCommand('takeout-fixer.selectTakeoutFolder', async () => {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Takeout Folder'
        });

        if (folderUri && folderUri[0]) {
            await processGoogleTakeout(folderUri[0].fsPath);
        }
    });

    let processCurrentFolderCommand = vscode.commands.registerCommand('takeout-fixer.processCurrentFolder', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            const takeoutPath = path.join(workspaceFolders[0].uri.fsPath, 'Takeout');
            if (fs.existsSync(takeoutPath)) {
                await processGoogleTakeout(takeoutPath);
            } else {
                vscode.window.showErrorMessage('Takeout folder not found in workspace');
            }
        }
    });

    context.subscriptions.push(processFilesCommand, selectFolderCommand, processCurrentFolderCommand);
}

async function processGoogleTakeout(takeoutPath?: string) {
    const config = vscode.workspace.getConfiguration('takeoutFixer');
    const preserveOriginals = config.get<boolean>('preserveOriginals', true);
    const organizeByDate = config.get<boolean>('organizeByDate', false);
    let outputFolder = config.get<string>('outputFolder', '');

    // If no path provided, ask user to select
    if (!takeoutPath) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            takeoutPath = path.join(workspaceFolders[0].uri.fsPath, 'Takeout');
            if (!fs.existsSync(takeoutPath)) {
                vscode.window.showErrorMessage('Takeout folder not found. Please use "Select Takeout Folder" command.');
                return;
            }
        } else {
            vscode.window.showErrorMessage('No workspace folder found. Please use "Select Takeout Folder" command.');
            return;
        }
    }

    // Set default output folder if not specified
    if (!outputFolder) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            outputFolder = path.join(workspaceFolders[0].uri.fsPath, 'ProcessedPhotos');
        } else {
            outputFolder = path.join(takeoutPath, '..', 'ProcessedPhotos');
        }
    }

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Processing Google Takeout files",
        cancellable: true
    }, async (progress, token) => {
        const exiftool = new ExifTool({ taskTimeoutMillis: 5000 });

        try {
            const files = await findMediaFiles(takeoutPath!);
            const totalFiles = files.length;
            let processedCount = 0;
            let errorCount = 0;

            progress.report({ increment: 0, message: `Found ${totalFiles} files to process` });

            for (const filePath of files) {
                if (token.isCancellationRequested) {
                    break;
                }

                try {
                    await processFile(filePath, outputFolder, exiftool, preserveOriginals, organizeByDate);
                    processedCount++;
                } catch (error) {
                    console.error(`Error processing ${filePath}:`, error);
                    errorCount++;
                }

                const percentComplete = (processedCount / totalFiles) * 100;
                progress.report({
                    increment: 100 / totalFiles,
                    message: `Processed ${processedCount}/${totalFiles} files (${errorCount} errors)`
                });
            }

            await exiftool.end();

            vscode.window.showInformationMessage(
                `Processing complete! ${processedCount} files processed, ${errorCount} errors. Output: ${outputFolder}`
            );

        } catch (error) {
            await exiftool.end();
            vscode.window.showErrorMessage(`Error processing files: ${error}`);
        }
    });
}

async function findMediaFiles(dirPath: string): Promise<string[]> {
    const mediaFiles: string[] = [];
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.heic', '.webp'];

    function scanDirectory(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                scanDirectory(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                // Skip metadata files
                if (!entry.name.includes('.json') && mediaExtensions.includes(ext)) {
                    // Check if corresponding metadata file exists
                    const metadataPath = fullPath + '.json';
                    const altMetadataPath = fullPath + '.supplemental-metadata.json';

                    if (fs.existsSync(metadataPath) || fs.existsSync(altMetadataPath)) {
                        mediaFiles.push(fullPath);
                    }
                }
            }
        }
    }

    scanDirectory(dirPath);
    return mediaFiles;
}

async function processFile(
    filePath: string,
    outputFolder: string,
    exiftool: ExifTool,
    preserveOriginals: boolean,
    organizeByDate: boolean
): Promise<void> {
    // Find metadata file
    const metadataPath = filePath + '.json';
    const altMetadataPath = filePath + '.supplemental-metadata.json';

    let metadataFilePath: string | null = null;
    if (fs.existsSync(metadataPath)) {
        metadataFilePath = metadataPath;
    } else if (fs.existsSync(altMetadataPath)) {
        metadataFilePath = altMetadataPath;
    }

    if (!metadataFilePath) {
        return; // No metadata file found
    }

    // Read metadata
    const metadataContent = fs.readFileSync(metadataFilePath, 'utf-8');
    const metadata: TakeoutMetadata = JSON.parse(metadataContent);

    // Determine output path
    let outputPath: string;
    const fileName = path.basename(filePath);

    if (organizeByDate && metadata.photoTakenTime?.timestamp) {
        const date = new Date(parseInt(metadata.photoTakenTime.timestamp) * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dateFolder = path.join(outputFolder, String(year), month);

        if (!fs.existsSync(dateFolder)) {
            fs.mkdirSync(dateFolder, { recursive: true });
        }

        outputPath = path.join(dateFolder, fileName);
    } else {
        outputPath = path.join(outputFolder, fileName);
    }

    // Copy file
    if (preserveOriginals) {
        fs.copyFileSync(filePath, outputPath);
    } else {
        fs.renameSync(filePath, outputPath);
    }

    // Apply metadata using exiftool
    const tags: any = {};

    // Date/Time
    if (metadata.photoTakenTime?.timestamp) {
        const date = new Date(parseInt(metadata.photoTakenTime.timestamp) * 1000);
        tags.DateTimeOriginal = date;
        tags.CreateDate = date;
    } else if (metadata.creationTime?.timestamp) {
        const date = new Date(parseInt(metadata.creationTime.timestamp) * 1000);
        tags.DateTimeOriginal = date;
        tags.CreateDate = date;
    }

    // GPS data
    const geoData = metadata.geoDataExif || metadata.geoData;
    if (geoData?.latitude !== undefined && geoData?.longitude !== undefined) {
        tags.GPSLatitude = geoData.latitude;
        tags.GPSLongitude = geoData.longitude;

        if (geoData.altitude !== undefined) {
            tags.GPSAltitude = geoData.altitude;
        }
    }

    // Title and Description
    if (metadata.title) {
        tags.Title = metadata.title;
        tags.ImageDescription = metadata.title;
    }

    if (metadata.description) {
        tags.Description = metadata.description;
        tags.UserComment = metadata.description;
    }

    // People/Keywords
    if (metadata.people && metadata.people.length > 0) {
        tags.Keywords = metadata.people.map(p => p.name);
        tags.PersonInImage = metadata.people.map(p => p.name);
    }

    // Write metadata to file
    if (Object.keys(tags).length > 0) {
        await exiftool.write(outputPath, tags, ['-overwrite_original']);
    }
}

export function deactivate() {
    console.log('Takeout Fixer extension is now deactivated');
}
