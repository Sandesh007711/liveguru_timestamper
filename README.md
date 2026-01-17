# SRT to YouTube Timestamp Converter

A React-based web application that converts SRT subtitle files into YouTube timestamp links.

## Features

- 📄 Upload SRT files
- ⏰ Automatically extracts timestamps
- ➖ Subtracts 3 seconds from each timestamp
- 🔗 Generates YouTube timestamp links
- 📋 Copy individual or all links to clipboard
- 🎨 Beautiful, responsive UI

## How It Works

1. Upload your SRT subtitle file
2. Enter your YouTube video link
3. The app will:
   - Extract starting timestamps from each subtitle entry
   - Subtract 3 seconds from each timestamp
   - Convert times to total seconds
   - Generate YouTube links with timestamp parameters (e.g., `?t=414`)

## Getting Started

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

1. Update the `homepage` field in `package.json` with your GitHub Pages URL:
   ```json
   "homepage": "https://yourusername.github.io/repository-name"
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## Usage

1. Click "Choose SRT File" and select your subtitle file
2. Paste your YouTube video link (supports various formats):
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - Direct video ID
3. View and copy the generated timestamp links
4. Click on any link to open YouTube at that specific time

## Example

**Input SRT:**
```
1
00:06:57,750 --> 00:07:00,416
<b>Kashyap - कश्यप
Manoj Kumar - मनोज कुमार</b>
```

**Output:**
- Extracted time: 00:06:57
- After subtracting 3 seconds: 00:06:54
- Converted to seconds: 414
- Generated link: `https://youtu.be/pCtU2FkLp0c?t=414`

## Technologies Used

- React 18
- CSS3 with modern animations
- JavaScript ES6+

## License

MIT
