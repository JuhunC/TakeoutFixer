import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExifTool } from 'exiftool-vendored';
import { getWebviewContent } from './webview';

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

interface ProcessingStats {
    total: number;
    processed: number;
    success: number;
    errors: number;
}

let currentPanel: vscode.WebviewPanel | undefined;
let cancellationTokenSource: vscode.CancellationTokenSource | undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log('Takeout Fixer extension is now active!');

    // Register command to open UI
    let openUICommand = vscode.commands.registerCommand('takeout-fixer.openUI', () => {
        openWebviewPanel(context);
    });

    // Legacy commands for backward compatibility
    let processFilesCommand = vscode.commands.registerCommand('takeout-fixer.processFiles', async () => {
        openWebviewPanel(context);
    });

    let selectFolderCommand = vscode.commands.registerCommand('takeout-fixer.selectTakeoutFolder', async () => {
        openWebviewPanel(context);
    });

    let processCurrentFolderCommand = vscode.commands.registerCommand('takeout-fixer.processCurrentFolder', async () => {
        openWebviewPanel(context);
    });

    context.subscriptions.push(openUICommand, processFilesCommand, selectFolderCommand, processCurrentFolderCommand);
}

function openWebviewPanel(context: vscode.ExtensionContext) {
    if (currentPanel) {
        currentPanel.reveal(vscode.ViewColumn.One);
        return;
    }

    currentPanel = vscode.window.createWebviewPanel(
        'takeoutFixerUI',
        'Takeout Fixer',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    currentPanel.webview.html = getWebviewContent(context.extensionUri);

    // Handle messages from webview
    currentPanel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'selectSourceFolder':
                    const sourceUri = await vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: 'Select Takeout Folder'
                    });
                    if (sourceUri && sourceUri[0]) {
                        currentPanel?.webview.postMessage({
                            command: 'setSourceFolder',
                            path: sourceUri[0].fsPath
                        });
                    }
                    break;

                case 'selectOutputFolder':
                    const outputUri = await vscode.window.showOpenDialog({
                        canSelectFiles: false,
                        canSelectFolders: true,
                        canSelectMany: false,
                        openLabel: 'Select Output Folder'
                    });
                    if (outputUri && outputUri[0]) {
                        currentPanel?.webview.postMessage({
                            command: 'setOutputFolder',
                            path: outputUri[0].fsPath
                        });
                    }
                    break;

                case 'startProcessing':
                    await processWithUI(
                        message.sourceFolder,
                        message.outputFolder,
                        message.preserveOriginals,
                        message.organizeByDate,
                        message.organizeBySource,
                        message.threadCount || 4
                    );
                    break;

                case 'stopProcessing':
                    if (cancellationTokenSource) {
                        cancellationTokenSource.cancel();
                        sendToWebview('log', { type: 'warning', message: 'Stopping processing...' });
                    }
                    break;
            }
        },
        undefined,
        context.subscriptions
    );

    currentPanel.onDidDispose(
        () => {
            currentPanel = undefined;
        },
        null,
        context.subscriptions
    );
}

function sendToWebview(command: string, data?: any) {
    currentPanel?.webview.postMessage({ command, ...data });
}

async function processWithUI(
    sourceFolder: string,
    outputFolder: string,
    preserveOriginals: boolean,
    organizeByDate: boolean,
    organizeBySource: boolean,
    threadCount: number
) {
    // Create new cancellation token
    cancellationTokenSource = new vscode.CancellationTokenSource();
    const token = cancellationTokenSource.token;

    // Set default output folder if not specified
    if (!outputFolder) {
        outputFolder = path.join(sourceFolder, '..', 'ProcessedPhotos');
    }

    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    sendToWebview('log', { type: 'info', message: `Starting processing with ${threadCount} threads...` });
    sendToWebview('log', { type: 'info', message: `Source: ${sourceFolder}` });
    sendToWebview('log', { type: 'info', message: `Output: ${outputFolder}` });
    if (organizeByDate) {
        sendToWebview('log', { type: 'info', message: `Organization: By Date (YYYY/MM)` });
    } else if (organizeBySource) {
        sendToWebview('log', { type: 'info', message: `Organization: By Source Structure` });
    } else {
        sendToWebview('log', { type: 'info', message: `Organization: Flat (All in Output Folder)` });
    }
    sendToWebview('status', { status: 'processing' });

    // Configure ExifTool with maxProcs matching thread count
    const exiftool = new ExifTool({
        taskTimeoutMillis: 300000, // Increased to 300s (5 mins) for massive video files
        maxProcs: threadCount
    });

    const stats: ProcessingStats = {
        total: 0,
        processed: 0,
        success: 0,
        errors: 0
    };

    try {
        // Find all media files
        sendToWebview('log', { type: 'info', message: 'Scanning for media files...' });
        const files = await findMediaFiles(sourceFolder);
        stats.total = files.length;

        sendToWebview('log', { type: 'success', message: `Found ${files.length} files to process` });
        sendToWebview('progress', { data: stats });

        // Concurrent Processing Logic
        const queue = [...files];
        const workers = [];

        // Worker function
        const worker = async (id: number) => {
            while (queue.length > 0 && !token.isCancellationRequested) {
                const filePath = queue.shift();
                if (!filePath) break;

                try {
                    await processFile(
                        filePath,
                        sourceFolder,
                        outputFolder,
                        exiftool,
                        preserveOriginals,
                        organizeByDate,
                        organizeBySource
                    );
                    stats.success++;
                } catch (error) {
                    stats.errors++;
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    // Customize error messages for known issues
                    let displayError = errorMessage;
                    if (errorMessage.includes('Truncated')) {
                        displayError = 'File is corrupt (truncated data)';
                    } else if (errorMessage.includes('OtherImageStart')) {
                        displayError = 'File has corrupt metadata header';
                    }

                    sendToWebview('error', {
                        file: path.basename(filePath),
                        error: displayError
                    });
                } finally {
                    stats.processed++;
                    // Update progress periodically
                    if (stats.processed % 10 === 0 || queue.length === 0) {
                        sendToWebview('progress', { data: stats });
                        if (stats.processed % 50 === 0) {
                            sendToWebview('log', {
                                type: 'info',
                                message: `Progress: ${stats.processed}/${stats.total} files processed`
                            });
                        }
                    }
                }
            }
        };

        // Start workers
        for (let i = 0; i < threadCount; i++) {
            workers.push(worker(i));
        }

        // Wait for all workers to finish
        await Promise.all(workers);

        await exiftool.end();

        // Check if stopped or completed
        if (token.isCancellationRequested) {
            sendToWebview('stopped', {});
            sendToWebview('log', {
                type: 'warning',
                message: `⚠️ Processing stopped. ${stats.success} files processed before stopping.`
            });
        } else {
            sendToWebview('complete', { data: stats });
            sendToWebview('log', {
                type: 'success',
                message: `✅ Processing complete! ${stats.success} files processed successfully.`
            });

            if (stats.errors > 0) {
                sendToWebview('log', {
                    type: 'warning',
                    message: `⚠️ ${stats.errors} files had errors. See unhandled cases below.`
                });
            }
        }

    } catch (error) {
        await exiftool.end();
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendToWebview('log', { type: 'error', message: `Fatal error: ${errorMessage}` });
        sendToWebview('status', { status: 'error' });
    } finally {
        cancellationTokenSource = undefined;
    }
}

async function findMediaFiles(dirPath: string): Promise<string[]> {
    const mediaFiles: string[] = [];
    const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov', '.avi', '.heic', '.webp'];

    function scanDirectory(dir: string) {
        try {
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
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error);
        }
    }

    scanDirectory(dirPath);
    return mediaFiles;
}

async function processFile(
    filePath: string,
    sourceFolder: string,
    outputFolder: string,
    exiftool: ExifTool,
    preserveOriginals: boolean,
    organizeByDate: boolean,
    organizeBySource: boolean
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
        throw new Error('No metadata file found');
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
    } else if (organizeBySource) {
        // Calculate relative path from sourceFolder
        const relativePath = path.relative(sourceFolder, path.dirname(filePath));
        const targetFolder = path.join(outputFolder, relativePath);

        if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
        }
        outputPath = path.join(targetFolder, fileName);
    } else {
        outputPath = path.join(outputFolder, fileName);
    }

    // Handle duplicate filenames
    if (fs.existsSync(outputPath)) {
        const ext = path.extname(fileName);
        const base = path.basename(fileName, ext);
        let counter = 1;
        while (fs.existsSync(outputPath)) {
            outputPath = path.join(path.dirname(outputPath), `${base}_${counter}${ext}`);
            counter++;
        }
    }

    // Copy or move file
    if (preserveOriginals) {
        fs.copyFileSync(filePath, outputPath);
    } else {
        fs.renameSync(filePath, outputPath);
    }

    // Apply metadata using exiftool
    const tags: any = {};

    // Helper function to format date for EXIF
    function formatDateForExif(timestamp: string): string {
        const date = new Date(parseInt(timestamp) * 1000);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
    }

    // Date/Time
    if (metadata.photoTakenTime?.timestamp) {
        const exifDate = formatDateForExif(metadata.photoTakenTime.timestamp);
        tags.DateTimeOriginal = exifDate;
        tags.CreateDate = exifDate;
    } else if (metadata.creationTime?.timestamp) {
        const exifDate = formatDateForExif(metadata.creationTime.timestamp);
        tags.DateTimeOriginal = exifDate;
        tags.CreateDate = exifDate;
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
        try {
            await exiftool.write(outputPath, tags, ['-overwrite_original', '-ignoreMinorErrors']);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Handle file type mismatch (e.g., "Not a valid PNG (looks more like a JPEG)")
            const match = errorMessage.match(/Not a valid \w+ \(looks more like a (\w+)\)/i);

            if (match && match[1]) {
                const realType = match[1].toLowerCase();
                let newExt = '.' + realType;

                // Map common types to standard extensions
                if (realType === 'jpeg') newExt = '.jpg';
                if (realType === 'tiff') newExt = '.tif';

                const newOutputPath = path.join(path.dirname(outputPath), path.basename(outputPath, path.extname(outputPath)) + newExt);

                // Rename the file
                try {
                    if (fs.existsSync(newOutputPath)) {
                        // If target exists, append counter
                        const base = path.basename(newOutputPath, newExt);
                        let counter = 1;
                        let uniquePath = newOutputPath;
                        while (fs.existsSync(uniquePath)) {
                            uniquePath = path.join(path.dirname(newOutputPath), `${base}_${counter}${newExt}`);
                            counter++;
                        }
                        fs.renameSync(outputPath, uniquePath);
                        outputPath = uniquePath;
                    } else {
                        fs.renameSync(outputPath, newOutputPath);
                        outputPath = newOutputPath;
                    }

                    // Retry writing metadata
                    await exiftool.write(outputPath, tags, ['-overwrite_original', '-ignoreMinorErrors']);

                } catch (retryError) {
                    // If retry fails, throw the original error or the new one
                    throw new Error(`Failed to fix file extension and write metadata: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                }
            }
            // Handle "unknown trailer" error (case insensitive partial match)
            else if (errorMessage.toLowerCase().includes('delete unknown trailer')) {
                try {
                    // Retry with -trailer= option to delete the unknown trailer
                    await exiftool.write(outputPath, tags, ['-overwrite_original', '-ignoreMinorErrors', '-trailer=']);
                } catch (retryError) {
                    throw new Error(`Failed to fix unknown trailer: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                }
            }
            // Handle corrupt metadata headers (OtherImageStart)
            else if (errorMessage.includes('OtherImageStart')) {
                try {
                    // Try to strip all metadata first, then write new metadata
                    await exiftool.write(outputPath, { all: null } as any, ['-overwrite_original', '-ignoreMinorErrors']);
                    await exiftool.write(outputPath, tags, ['-overwrite_original', '-ignoreMinorErrors']);
                } catch (retryError) {
                    throw new Error(`Corrupt metadata header (unfixable): ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                }
            }
            else {
                throw error;
            }
        }
    }
}

export function deactivate() {
    console.log('Takeout Fixer extension is now deactivated');
}
