// Helper function for natural sorting
function naturalSortKey(s) {
  return s.split(/(\d+)/).map(part => (isNaN(part) ? part.toLowerCase() : parseInt(part, 10)));
}

// Function to validate the LSX file
function validateLsxFile(lines) {
  const regionIdLine = lines[3]?.trim(); // Line 4
  const nodeIdLine = lines[4]?.trim(); // Line 5
  return (
    regionIdLine === '<region id="MaterialBank">' &&
    nodeIdLine === '<node id="MaterialBank">'
  );
}

// Function to update line 10 in .lsx files and extract shader file
function updateLine10AndGetShader(line) {
  let shaderFile = null;
  const match = line.match(/value="([^"]+)"/);
  if (match) {
    const originalValue = match[1];
    let newValue = originalValue.replace(/Public\/[^/]+\/Assets/, "Public/Shared/Assets");
    newValue = newValue.replace(/_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, "");
    shaderFile = newValue.split("/").pop();
    line = line.replace(originalValue, newValue);
  }
  return { updatedLine: line, shaderFile };
}

// Function to process LSX files
async function processLsxFiles(files) {
  const outputZip = new JSZip();
  const reportLines = [];
  const outputDir = "Updated_Materials_RDY/";

  for (let file of files) {
    if (file.name.endsWith(".lsx")) {
      const fileContent = await file.text();
      const lines = fileContent.split("\n");

      // Validate the file based on lines 4 and 5
      if (!validateLsxFile(lines)) {
        console.warn(`File "${file.name}" is invalid and will be skipped.`);
        continue;
      }

      const updatedContent = [];
      let materialName = null;
      let shaderFile = null;

      lines.forEach((line, idx) => {
        if (idx === 8) { // Line 9
          const match = line.match(/value="([^"]+)"/);
          if (match) {
            materialName = match[1];
          }
        } else if (idx === 9) { // Line 10
          const result = updateLine10AndGetShader(line);
          updatedContent.push(result.updatedLine);
          shaderFile = result.shaderFile;
        } else {
          updatedContent.push(line);
        }
      });

      const updatedFileName = file.name;
      outputZip.file(`${outputDir}${updatedFileName}`, updatedContent.join("\n"));

      if (materialName && shaderFile) {
        reportLines.push({ materialName, updatedFileName, shaderFile });
      }
    } else {
      console.warn(`File "${file.name}" is not an .lsx file and will be skipped.`);
    }
  }

  // Generate and download ZIP
  const zipBlob = await outputZip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(zipBlob);
  downloadLink.download = "Processed_Files.zip";
  downloadLink.click();
}

// UI Logic
document.getElementById("fileInput").addEventListener("change", async (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    await processLsxFiles(files);
    alert("Processing complete! Download started.");
  } else {
    alert("Please select at least one .lsx file.");
  }
});
