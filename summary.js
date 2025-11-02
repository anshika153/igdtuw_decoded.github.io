const fileInput = document.getElementById('fileInput');
    const attachments = document.getElementById('attachments');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summarizeIcon = document.getElementById('summarizeIcon');

    // Show uploaded file preview
    fileInput.addEventListener('change', (e) => {
      attachments.innerHTML = ''; // clear previous
      Array.from(e.target.files).forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-box';
        div.innerHTML = `
          <div class="file-icon">📄</div>
          <div class="file-info">
            <p class="file-name">${file.name}</p>
            <p class="file-size">${(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button class="remove-file">✖</button>
        `;
        attachments.appendChild(div);

        div.querySelector('.remove-file').onclick = () => div.remove();
      });
    });

    // Common function for summarizing (placeholder)
    function summarize() {
      alert('Summarizing text or attached files...');
    }

    summarizeBtn.addEventListener('click', summarize);
    summarizeIcon.addEventListener('click', summarize);

const textInput = document.getElementById('textInput');

let uploadedFiles = [];
const HF_API_TOKEN = "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"; 

// Handle file uploads and show file preview
fileInput.addEventListener('change', async (e) => {
  attachments.innerHTML = '';
  uploadedFiles = Array.from(e.target.files);

  uploadedFiles.forEach(file => {
    const div = document.createElement('div');
    div.className = 'file-box';
    div.innerHTML = `
      <div class="file-icon">📄</div>
      <div class="file-info">
        <p class="file-name">${file.name}</p>
        <p class="file-size">${(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <button class="remove-file">✖</button>
    `;
    attachments.appendChild(div);
    div.querySelector('.remove-file').onclick = () => div.remove();
  });
});

// Convert PDF or DOCX to plain text
async function extractTextFromFile(file) {
  const fileType = file.name.split('.').pop().toLowerCase();

  if (fileType === 'pdf') {
    const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.2.67/build/pdf.min.mjs');
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ') + '\n';
    }
    return text;
  } 
  else if (fileType === 'docx') {
    const docx = await import('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js');
    const arrayBuffer = await file.arrayBuffer();
    const result = await docx.extractRawText({ arrayBuffer });
    return result.value;
  } 
  else {
    alert("Unsupported file type. Please upload PDF or DOCX.");
    return '';
  }
}

// Hugging Face Summarization API Call
async function summarizeText(text) {
  const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: text })
  });

  const result = await response.json();
  if (result.error) {
    alert("Error: " + result.error);
    return "Error summarizing text.";
  }
  return result[0].summary_text;
}

// Display summary result
async function summarize() {
  let inputText = textInput.value.trim();

  // If file uploaded, extract text
  if (uploadedFiles.length > 0) {
    const fileTextParts = [];
    for (let file of uploadedFiles) {
      const extracted = await extractTextFromFile(file);
      fileTextParts.push(extracted);
    }
    inputText = fileTextParts.join('\n');
  }

  if (!inputText) {
    alert("Please enter or upload text first!");
    return;
  }

  // Show loading
  attachments.innerHTML = `<p style="color:#f7dba7;">⏳ Summarizing... please wait</p>`;

  const summary = await summarizeText(inputText);

  attachments.innerHTML = `
    <div class="file-box" style="background:#1a1a1a;">
      <div class="file-icon">📝</div>
      <div class="file-info">
        <p class="file-name">Summary Result:</p>
        <p class="file-size" style="color:#fff;">${summary}</p>
      </div>
    </div>
  `;
}

// Trigger summarize on both button and icon click
summarizeBtn.addEventListener('click', summarize);
summarizeIcon.addEventListener('click', summarize);

// Create popup modal dynamically
function showSummaryPopup(summary) {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';

  // Create popup box
  const popup = document.createElement('div');
  popup.className = 'popup-box';

  popup.innerHTML = `
    <h2>✨ Summary Result</h2>
    <p class="popup-text">${summary}</p>
    <button class="close-popup">Close</button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Close popup on click
  popup.querySelector('.close-popup').onclick = () => overlay.remove();
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

// Modify your summarize() function to call popup
async function summarize() {
  let inputText = textInput.value.trim();

  if (uploadedFiles.length > 0) {
    const fileTextParts = [];
    for (let file of uploadedFiles) {
      const extracted = await extractTextFromFile(file);
      fileTextParts.push(extracted);
    }
    inputText = fileTextParts.join('\n');
  }

  if (!inputText) {
    alert("Please enter or upload text first!");
    return;
  }

  attachments.innerHTML = `<p style="color:#f7dba7;">⏳ Summarizing... please wait</p>`;

  const summary = await summarizeText(inputText);

  attachments.innerHTML = ''; // clear loader
  showSummaryPopup(summary); // 🎉 show popup
}

// Trigger summarize on both button and icon click
summarizeBtn.addEventListener('click', summarize);
summarizeIcon.addEventListener('click', summarize);
