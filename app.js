function initializeApp() {
    const modeToggle = document.getElementById("modeToggle");
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const downloadButton = document.getElementById("downloadButton");
    const statusMessage = document.createElement("div");
    statusMessage.id = "statusMessage";
    statusMessage.style.marginTop = "20px";
    statusMessage.style.color = "#5f6d45";
    document.body.appendChild(statusMessage);

    let currentMode = "lsx"; // Default mode is .lsx

    // Update drop zone text and button on mode toggle
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
