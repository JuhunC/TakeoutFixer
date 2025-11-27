import * as vscode from 'vscode';

export function getWebviewContent(extensionUri: vscode.Uri): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Takeout Fixer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        h1 {
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }

        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .section {
            margin-bottom: 30px;
            padding: 25px;
            background: #f8f9fa;
            border-radius: 12px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }

        .section:hover {
            border-color: #667eea;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
        }

        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }

        .folder-input {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }

        input[type="text"] {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
        }

        input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-browse {
            background: #667eea;
            color: white;
        }

        .btn-browse:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-process {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            width: 100%;
            padding: 16px;
            font-size: 16px;
            margin-top: 20px;
        }

        .btn-process:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-process:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn-stop {
            background: linear-gradient(135deg, #f56565 0%, #c53030 100%);
            color: white;
            width: 100%;
            padding: 16px;
            font-size: 16px;
            margin-top: 10px;
            display: none;
        }

        .btn-stop.active {
            display: block;
        }

        .btn-stop:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .checkbox-item:hover {
            background: #f0f4ff;
        }

        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
            accent-color: #667eea;
        }

        .checkbox-label {
            flex: 1;
            cursor: pointer;
            font-size: 14px;
        }

        .checkbox-description {
            font-size: 12px;
            color: #666;
            margin-top: 2px;
        }

        .progress-section {
            display: none;
            margin-top: 30px;
        }

        .progress-section.active {
            display: block;
        }

        .progress-bar-container {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 15px;
        }

        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
            width: 0%;
        }

        .progress-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
        }

        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }

        .log-container {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.6;
        }

        .log-entry {
            margin-bottom: 8px;
            padding: 4px 0;
        }

        .log-entry.error {
            color: #f48771;
        }

        .log-entry.warning {
            color: #dcdcaa;
        }

        .log-entry.success {
            color: #4ec9b0;
        }

        .log-entry.info {
            color: #9cdcfe;
        }

        .log-timestamp {
            color: #858585;
            margin-right: 10px;
        }

        .error-list {
            margin-top: 20px;
        }

        .error-item {
            background: #fff5f5;
            border-left: 4px solid #f56565;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
        }

        .error-file {
            font-weight: 600;
            color: #c53030;
            margin-bottom: 4px;
        }

        .error-message {
            font-size: 13px;
            color: #666;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }

        .status-badge.idle {
            background: #e9ecef;
            color: #666;
        }

        .status-badge.processing {
            background: #667eea;
            color: white;
            animation: pulse 2s infinite;
        }

        .status-badge.complete {
            background: #48bb78;
            color: white;
        }

        .status-badge.error {
            background: #f56565;
            color: white;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: #2d2d2d;
        }

        ::-webkit-scrollbar-thumb {
            background: #555;
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📸 Takeout Fixer</h1>
        <p class="subtitle">Apply Google Takeout metadata to your photos and videos</p>

        <!-- Folder Selection -->
        <div class="section">
            <div class="section-title">Source Folder</div>
            <div class="folder-input">
                <input type="text" id="sourceFolder" placeholder="Select your Takeout folder..." readonly>
                <button class="btn-browse" onclick="selectSourceFolder()">📁 Browse</button>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Output Folder</div>
            <div class="folder-input">
                <input type="text" id="outputFolder" placeholder="Select output folder (leave empty for default)..." readonly>
                <button class="btn-browse" onclick="selectOutputFolder()">📁 Browse</button>
            </div>
        </div>

        <!-- Options -->
        <div class="section">
            <div class="section-title">Processing Options</div>
            <div class="checkbox-group">
                <label class="checkbox-item">
                    <input type="checkbox" id="preserveOriginals" checked>
                    <div class="checkbox-label">
                        <div>Preserve Original Files</div>
                        <div class="checkbox-description">Keep original files and create copies with metadata</div>
                    </div>
                </label>
                <label class="checkbox-item">
                    <input type="checkbox" id="organizeByDate" onchange="toggleOrganizeOption('date')">
                    <div class="checkbox-label">
                        <div>Organize by Date</div>
                        <div class="checkbox-description">Organize files into YYYY/MM folder structure</div>
                    </div>
                </label>
                <label class="checkbox-item">
                    <input type="checkbox" id="organizeBySource" onchange="toggleOrganizeOption('source')">
                    <div class="checkbox-label">
                        <div>Organize by Source Structure</div>
                        <div class="checkbox-description">Maintain original folder structure (e.g. Album names)</div>
                    </div>
                </label>
            </div>
        </div>

        <!-- Performance Settings -->
        <div class="section">
            <div class="section-title">Performance</div>
            <div class="folder-input" style="align-items: center;">
                <label for="threadCount" style="margin-right: 10px; font-weight: 500;">Number of Threads:</label>
                <input type="number" id="threadCount" value="4" min="1" max="32" style="width: 80px;">
                <div class="checkbox-description" style="margin-left: 10px;">(Higher = faster, but uses more CPU/RAM)</div>
            </div>
        </div>

        <!-- Process Button -->
        <button class="btn-process" id="processBtn" onclick="startProcessing()">
            🚀 Start Processing
        </button>

        <!-- Stop Button -->
        <button class="btn-stop" id="stopBtn" onclick="stopProcessing()">
            🛑 Stop Processing
        </button>

        <!-- Progress Section -->
        <div class="progress-section" id="progressSection">
            <div class="section">
                <span class="status-badge idle" id="statusBadge">Idle</span>
                <div class="progress-bar-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="progress-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="totalFiles">0</div>
                        <div class="stat-label">Total Files</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="processedFiles">0</div>
                        <div class="stat-label">Processed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="successFiles">0</div>
                        <div class="stat-label">Success</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="errorFiles">0</div>
                        <div class="stat-label">Errors</div>
                    </div>
                </div>

                <div class="section-title">Activity Log</div>
                <div class="log-container" id="logContainer">
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div>No activity yet</div>
                    </div>
                </div>

                <div id="errorListContainer"></div>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let errors = [];

        function selectSourceFolder() {
            vscode.postMessage({ command: 'selectSourceFolder' });
        }

        function selectOutputFolder() {
            vscode.postMessage({ command: 'selectOutputFolder' });
        }

        function toggleOrganizeOption(option) {
            const dateCheckbox = document.getElementById('organizeByDate');
            const sourceCheckbox = document.getElementById('organizeBySource');

            if (option === 'date' && dateCheckbox.checked) {
                sourceCheckbox.checked = false;
            } else if (option === 'source' && sourceCheckbox.checked) {
                dateCheckbox.checked = false;
            }
        }

        function startProcessing() {
            const sourceFolder = document.getElementById('sourceFolder').value;
            const outputFolder = document.getElementById('outputFolder').value;
            const preserveOriginals = document.getElementById('preserveOriginals').checked;
            const organizeByDate = document.getElementById('organizeByDate').checked;
            const organizeBySource = document.getElementById('organizeBySource').checked;
            const threadCount = parseInt(document.getElementById('threadCount').value) || 4;

            if (!sourceFolder) {
                addLog('error', 'Please select a source folder');
                return;
            }

            vscode.postMessage({
                command: 'startProcessing',
                sourceFolder,
                outputFolder,
                preserveOriginals,
                organizeByDate,
                organizeBySource,
                threadCount
            });

            document.getElementById('processBtn').disabled = true;
            document.getElementById('stopBtn').classList.add('active');
            document.getElementById('progressSection').classList.add('active');
            updateStatus('processing');
            errors = [];
        }

        function stopProcessing() {
            vscode.postMessage({ command: 'stopProcessing' });
            addLog('warning', 'Stop requested by user...');
            document.getElementById('stopBtn').disabled = true;
        }

        function addLog(type, message) {
            const logContainer = document.getElementById('logContainer');
            const emptyState = logContainer.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }

            const timestamp = new Date().toLocaleTimeString();
            const entry = document.createElement('div');
            entry.className = \`log-entry \${type}\`;
            entry.innerHTML = \`<span class="log-timestamp">[\${timestamp}]</span>\${message}\`;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        function updateProgress(data) {
            document.getElementById('totalFiles').textContent = data.total || 0;
            document.getElementById('processedFiles').textContent = data.processed || 0;
            document.getElementById('successFiles').textContent = data.success || 0;
            document.getElementById('errorFiles').textContent = data.errors || 0;

            const percentage = data.total > 0 ? (data.processed / data.total * 100) : 0;
            document.getElementById('progressBar').style.width = percentage + '%';
        }

        function updateStatus(status) {
            const badge = document.getElementById('statusBadge');
            badge.className = 'status-badge ' + status;
            badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }

        function addError(file, error) {
            errors.push({ file, error });
            updateErrorList();
        }

        function updateErrorList() {
            if (errors.length === 0) return;

            const container = document.getElementById('errorListContainer');
            container.innerHTML = \`
                <div class="error-list">
                    <div class="section-title">Unhandled Cases (\${errors.length})</div>
                    \${errors.map(e => \`
                        <div class="error-item">
                            <div class="error-file">\${e.file}</div>
                            <div class="error-message">\${e.error}</div>
                        </div>
                    \`).join('')}
                </div>
            \`;
        }

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'setSourceFolder':
                    document.getElementById('sourceFolder').value = message.path;
                    addLog('info', 'Source folder selected: ' + message.path);
                    break;
                case 'setOutputFolder':
                    document.getElementById('outputFolder').value = message.path;
                    addLog('info', 'Output folder selected: ' + message.path);
                    break;
                case 'log':
                    addLog(message.type, message.message);
                    break;
                case 'progress':
                    updateProgress(message.data);
                    break;
                case 'status':
                    updateStatus(message.status);
                    break;
                case 'error':
                    addError(message.file, message.error);
                    addLog('error', \`Error processing \${message.file}: \${message.error}\`);
                    break;
                case 'complete':
                    updateStatus('complete');
                    document.getElementById('processBtn').disabled = false;
                    document.getElementById('stopBtn').classList.remove('active');
                    document.getElementById('stopBtn').disabled = false;
                    addLog('success', \`Processing complete! \${message.data.success} files processed successfully, \${message.data.errors} errors.\`);
                    break;
                case 'stopped':
                    updateStatus('idle');
                    document.getElementById('processBtn').disabled = false;
                    document.getElementById('stopBtn').classList.remove('active');
                    document.getElementById('stopBtn').disabled = false;
                    addLog('warning', 'Processing stopped by user.');
                    break;
            }
        });
    </script>
</body>
</html>`;
}
