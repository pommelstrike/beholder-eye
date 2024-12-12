// Function to generate a UTC timestamp
function getUtcTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// Function to handle folder traversal and build Markdown tree for .bshd files
async function generateMarkdownTree(dataTransfer) {
    const markdownLines = [];

    async function traverseDirectory(entry, path = "") {
        if (entry.isFile && entry.name.endsWith(".bshd")) {
            markdownLines.push(`${path}- ${entry.name}`);
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            const entries = await new Promise((resolve) => reader.readEntries(resolve));
            markdownLines.push(`${path}- ${entry.name}/`);
            for (const subEntry of entries) {
                await traverseDirectory(subEntry, `${path}  `);
            }
        }
    }

    for (const item of dataTransfer.items) {
        const entry = item.webkitGetAsEntry();
        if (entry.isDirectory) {
            await traverseDirectory(entry);
        }
    }

    return markdownLines.join("\n");
}

// Function to process multiple .lsx files and generate a report
async function handleFileProcessing(files) {
    const processedFiles = [];
    const reportLines = [
        "If you like more tools like this, please consider supporting me to create more BG3 tools and mods https://www.patreon.com/pommelstrike , thank you.\n\n"
    ];
    let globalIndex = 1;

    for (const file of files) {
        const content = await file.text();

        try {
            const { updatedContent, reportEntries } = processLSXContent(content, file.name);
            processedFiles.push({ name: file.name, content: updatedContent });

            reportEntries.forEach((entry) => {
                reportLines.push(
                    `${String(globalIndex++).padStart(3, "0")}: Material Updated for: ${entry.materialName}\n    File: ${entry.fileName}\n    Shader: ${entry.shaderFile}\n`
                );
            });
        } catch (error) {
            console.error(`Error processing file ${file.name}: ${error.message}`);
        }
    }

    const reportContent = reportLines.join("\n");
    processedFiles.push({
        name: "Update_Report.txt",
        content: reportContent,
    });

    return processedFiles;
}

// Function to generate a ZIP file containing updated files and the report
function generateZip(processedFiles) {
    const zip = new JSZip();
    processedFiles.forEach(({ name, content }) => {
        zip.file(name, content);
    });
    return zip.generateAsync({ type: "blob" });
}

// Initialize the app
function initializeApp() {
    const modeToggle = document.getElementById("modeToggle");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const downloadButton = document.getElementById("downloadButton");
    const statusMessage = document.createElement("div");
    statusMessage.id = "statusMessage";
    statusMessage.style.marginTop = "20px";
    statusMessage.style.color = "#03DAC5";
    document.body.appendChild(statusMessage);

    let currentMode = "lsx"; // Default mode

    // Update drop zone text and styles dynamically
    function updateMode() {
        if (currentMode === "lsx") {
            modeToggle.textContent = "Switch to Markdown Tree Mode";
            dropZone.textContent = ".lsx MaterialBank Shader Repoint Mode - Drag and drop your .lsx MaterialBank files here";
            dropZone.style.borderColor = "#5f6d45";
            dropZone.style.backgroundColor = "#0e0e0e";
        } else {
            modeToggle.textContent = "Switch to LSX Processing Mode";
            dropZone.textContent = ".bshd Shader File Detector Mode - Drag and drop your project Assets folder here";
            dropZone.style.borderColor = "#a58c71";
            dropZone.style.backgroundColor = "#273f2f";
        }
    }

    modeToggle.addEventListener("click", () => {
        currentMode = currentMode === "lsx" ? "bshd" : "lsx";
        updateMode();
    });

    updateMode(); // Initialize with the default mode

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = currentMode === "lsx" ? "#273f2f" : "#5f6d45";
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.style.backgroundColor = currentMode === "lsx" ? "#0e0e0e" : "#273f2f";
    });

    dropZone.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = currentMode === "lsx" ? "#0e0e0e" : "#273f2f";

        if (currentMode === "lsx") {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                fileInput.dispatchEvent(new Event("change"));
            }
        } else if (currentMode === "bshd") {
            statusMessage.textContent = "Generating Markdown tree... Please wait.";
            try {
                const markdownTree = await generateMarkdownTree(e.dataTransfer);
                const blob = new Blob([markdownTree], { type: "text/markdown" });
                const url = URL.createObjectURL(blob);
                downloadButton.href = url;
                downloadButton.download = `Markdown_Tree_${getUtcTimestamp()}.md`;
                downloadButton.style.display = "block";
                downloadButton.textContent = "Download Markdown Tree";
                statusMessage.textContent = "All Done!";
            } catch (error) {
                console.error("Error generating markdown tree:", error);
                statusMessage.textContent = "An error occurred. Please try again.";
            }
        }
    });

    fileInput.addEventListener("change", async (event) => {
        if (currentMode === "lsx") {
            statusMessage.textContent = "Processing files... Please wait.";
            const files = Array.from(event.target.files);
            const processedFiles = await handleFileProcessing(files);
            const zipBlob = await generateZip(processedFiles);

            const timestamp = getUtcTimestamp();
            const url = URL.createObjectURL(zipBlob);
            downloadButton.href = url;
            downloadButton.download = `LSX_processed_files_${timestamp}.zip`;
            downloadButton.style.display = "block";
            downloadButton.textContent = "Download Processed Files";
            document.getElementById("patreonMessage").style.display = "block";
            statusMessage.textContent = "All Done!";
        }
    });
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", initializeApp);
