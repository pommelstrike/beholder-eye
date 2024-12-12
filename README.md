# beholder-eye Client-side LSX file processor for updating materialbank region .lsx files 
# and to mitgate consoles from crashing and re-direct MOD KIT GENERATED project shaders to pre-packaged BG3 game shader for Game Console compatibility.

https://beholder-eye.vercel.app

# pommelstrike's BeholderEye Tool

## Overview
**BeholderEye** is a versatile web-based tool designed for managing `.lsx` and `.bshd` files used in Baldur's Gate 3 modding projects. It offers two distinct modes:
1. **MaterialBank Shader Repoint Mode**: Processes `.lsx` files to fix shader references for compatibility with Baldur's Gate 3.
2. **Markdown Tree Mode**: Scans directories to generate a Markdown-formatted tree structure of `.bshd` shader files.

The tool runs entirely in the browser, ensuring your files are processed locally without uploads.

---

## Features

### 1. MaterialBank Shader Repoint Mode
- **Function**: Processes `.lsx` files to update shader references and ensures compatibility with Baldur's Gate 3.
- **Key Actions**:
  - Validates the presence of `<region id="MaterialBank">` and `<node id="MaterialBank">` in `.lsx` files.
  - Updates shader file paths (e.g., changing `Public/<mod_name>/Assets` to `Public/Shared/Assets`).
  - Removes unnecessary GUID suffixes from shader file references.
- **Output**:
  - Updated `.lsx` files.
  - A detailed `Update_Report.txt` summarizing the changes.
  - Packaged as a `.zip` file for download.

### 2. Markdown Tree Mode
- **Function**: Generates a Markdown tree structure for a directory of `.bshd` shader files.
- **Key Actions**:
  - Recursively scans directories for `.bshd` files.
  - Formats the directory structure into a Markdown file.
  - Highlights `.bshd` files for quick reference.
- **Output**:
  - A downloadable `.md` file containing the directory tree structure.

## Usage

### MaterialBank Shader Repoint Mode
1. **Step 1**: Drag and drop `.lsx` files into the drop zone.
2. **Step 2**: The tool processes the files and generates updated `.lsx` files along with a report.
3. **Step 3**: Click the "Download Processed Files" button to retrieve a `.zip` containing the results.

### Markdown Tree Mode
1. **Step 1**: Toggle to "Markdown Tree Mode" using the **Switch to Markdown Tree Mode** button.
2. **Step 2**: Drag and drop a folder into the drop zone.
3. **Step 3**: The tool generates a Markdown tree structure of the folder's contents, highlighting `.bshd` files.
4. **Step 4**: Click "Download Markdown Tree" to download the `.md` file.

---

## Contributing
Contributions are welcome! If you'd like to report bugs, suggest features, or submit code, please create an issue or pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Support
If you find this tool helpful, please consider supporting me on Patreon:
[![Patreon](https://img.shields.io/badge/Support-Patreon-orange)](https://www.patreon.com/pommelstrike)
