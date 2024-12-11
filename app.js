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

// Function to process and validate .lsx content
function processLSXContent(fileContent, fileName) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fileContent, "text/xml");

    // Validate XML structure
    const region = xmlDoc.querySelector("region[id='MaterialBank']");
    const node = xmlDoc.querySelector("node[id='MaterialBank']");

    if (!region || !node) {
        throw new Error(`File ${fileName} is invalid: Missing required <region> or <node> with id='MaterialBank'.`);
    }

    // Find and process <attribute> elements
    const resourceNodes = xmlDoc.querySelectorAll("node[id='Resource']");
    let reportEntries = [];
    resourceNodes.forEach((resourceNode) => {
        const sourceFileAttr = resourceNode.querySelector("attribute[id='SourceFile']");
        const nameAttr = resourceNode.querySelector("attribute[id='Name']");
        if (sourceFileAttr) {
            const originalValue = sourceFileAttr.getAttribute("value");
            const newValue = originalValue
                .replace(/Public\/[^/]+\/Assets/, "Public/Shared/Assets")
                .replace(/_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/, "");

            sourceFileAttr.setAttribute("value", newValue);

            // Collect report details
            reportEntries.push({
                materialName: nameAttr ? nameAttr.getAttribute("value") : "Unknown",
                shaderFile: newValue.split("/").pop(),
                fileName: fileName,
            });
        }
    });

    // Serialize XML back to string
    const serializer = new XMLSerializer();
    const updatedContent = serializer.serializeToString(xmlDoc);
    return { updatedContent, reportEntries };
}

// Function to process multiple .lsx files and generate a report
async function handleFileProcessing(files) {
    const processedFiles = [];
    const reportLines = [
        "If you like more tools like this, please consider supporting me to create more BG3 tools and mods https://www.patreon.com/pommelstrike , thank you.\n\n"
    ];
    let globalIndex = 1; // Initialize a global index for numerical sequence

    for (const file of files) {
        const content = await file.text();

        try {
            const { updatedContent, reportEntries } = processLSXContent(content, file.name);
            processedFiles.push({ name: file.name, content: updatedContent });

            // Add report entries with proper sequence
            reportEntries.forEach((entry) => {
                reportLines.push(
                    `${String(globalIndex++).padStart(3, "0")}: Material Updated for: ${entry.materialName}\n    File: ${entry.fileName}\n    Shader: ${entry.shaderFile}\n`
                );
            });
        } catch (error) {
            console.error(`Error processing file ${file.name}: ${error.message}`);
        }
    }

    // Add report to processed files
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
    const inputElement = document.getElementById("fileInput");
    const downloadButton = document.getElementById("downloadButton");
    const statusMessage = document.createElement("div");
    statusMessage.id = "statusMessage";
    statusMessage.style.marginTop = "20px";
    statusMessage.style.color = "#03DAC5";
    document.body.appendChild(statusMessage);

    inputElement.addEventListener("change", async (event) => {
        statusMessage.textContent = "Processing files... Please wait.";
        const files = Array.from(event.target.files);
        const processedFiles = await handleFileProcessing(files);
        const zipBlob = await generateZip(processedFiles);

        // Generate UTC timestamp
        const timestamp = getUtcTimestamp();

        // Create download link for ZIP with renamed file
        const url = URL.createObjectURL(zipBlob);
        downloadButton.href = url;
        downloadButton.download = `LSX_processed_files_${timestamp}.zip`;
        downloadButton.style.display = "block";
        downloadButton.textContent = "Download Processed Files";

        // Display Patreon message and status
        document.getElementById("patreonMessage").style.display = "block";
        statusMessage.textContent = "All Done!";
    });
}

// Initialize on DOM content loaded
document.addEventListener("DOMContentLoaded", initializeApp);
