/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-05-01
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== IMAGE OPTIMIZER SCRIPT ============================ */

/* ------------------------- DOM ELEMENTS ------------------------- */
const fileInput          = document.getElementById('fileInput');
const selectFileBtn      = document.getElementById('selectFileBtn');
const uploadArea         = document.getElementById('uploadArea');
const originalPreview    = document.getElementById('originalPreview');
const noImageMsg         = document.getElementById('noImageMsg');
const originalInfoDiv    = document.getElementById('originalInfo');
const origDimensionsSpan = document.getElementById('origDimensions');
const origSizeSpan       = document.getElementById('origSize');

const outputFormatSelect = document.getElementById('outputFormat');
const qualitySlider      = document.getElementById('qualitySlider');
const qualityValSpan     = document.getElementById('qualityVal');
const qualityGroup       = document.getElementById('qualityGroup');
const maxWidthInput      = document.getElementById('maxWidth');
const maxHeightInput     = document.getElementById('maxHeight');
const convertBtn         = document.getElementById('convertBtn');
const resultArea         = document.getElementById('resultArea');
const outputImage        = document.getElementById('outputImage');
const outputInfo         = document.getElementById('outputInfo');
const downloadLink       = document.getElementById('downloadLink');
const errorMsgDiv        = document.getElementById('errorMsg');

/* ------------------------- STATE ------------------------- */
let currentImageElement  = null;
let currentImageBlobURL  = null;
let originalFileObj      = null;
let originalWidth        = 0;
let originalHeight       = 0;
let originalFileSizeBytes = 0;
let currentOutputBlobURL = null;

/* ------------------------- UTILITY FUNCTIONS ------------------------- */
function showError(msg) {
    errorMsgDiv.style.display = 'block';
    errorMsgDiv.innerText = msg;
    setTimeout(() => {
        errorMsgDiv.style.display = 'none';
    }, 3700);
}

function revokePreviousImageURL() {
    if (currentImageBlobURL) {
        URL.revokeObjectURL(currentImageBlobURL);
        currentImageBlobURL = null;
    }
}

function revokeOutputURL() {
    if (currentOutputBlobURL) {
        URL.revokeObjectURL(currentOutputBlobURL);
        currentOutputBlobURL = null;
    }
}

function resetResultArea() {
    resultArea.style.display = 'none';
    revokeOutputURL();
    outputImage.src = '';
    outputInfo.innerHTML = '';
}

function calcNewDimensions(imgW, imgH, maxW, maxH) {
    let targetW = imgW;
    let targetH = imgH;
    let resized = false;

    if (maxW && maxW > 0 && maxH && maxH > 0) {
        const ratioW = maxW / imgW;
        const ratioH = maxH / imgH;
        const scale = Math.min(ratioW, ratioH);
        if (scale < 1) {
            targetW = Math.floor(imgW * scale);
            targetH = Math.floor(imgH * scale);
            resized = true;
        }
    } else if (maxW && maxW > 0) {
        if (maxW < imgW) {
            const ratio = maxW / imgW;
            targetW = maxW;
            targetH = Math.floor(imgH * ratio);
            resized = true;
        }
    } else if (maxH && maxH > 0) {
        if (maxH < imgH) {
            const ratio = maxH / imgH;
            targetH = maxH;
            targetW = Math.floor(imgW * ratio);
            resized = true;
        }
    }

    if (targetW < 1) targetW = 1;
    if (targetH < 1) targetH = 1;
    return { width: targetW, height: targetH, resized };
}

function toggleQualityControl() {
    const format = outputFormatSelect.value;
    if (format === 'image/png') {
        qualitySlider.disabled = true;
        qualityGroup.style.opacity = '0.6';
    } else {
        qualitySlider.disabled = false;
        qualityGroup.style.opacity = '1';
    }
}

function updateQualitySlider() {
    const percent = Math.round(qualitySlider.value * 100);
    qualityValSpan.innerText = `${percent}%`;
    qualitySlider.style.background =
        `linear-gradient(90deg, #FD7E14 ${percent}%, #1e1e2a ${percent}%)`;
}

/* ------------------------- IMAGE LOADING ------------------------- */
function loadImageFromFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showError('Invalid file. Please select a valid image (JPEG, PNG, WebP, GIF, BMP).');
        return false;
    }
    originalFileObj = file;
    originalFileSizeBytes = file.size;
    revokePreviousImageURL();
    const objectURL = URL.createObjectURL(file);
    currentImageBlobURL = objectURL;
    const img = new Image();
    img.onload = function () {
        originalWidth = img.width;
        originalHeight = img.height;
        originalPreview.src = objectURL;
        originalPreview.style.display = 'block';
        noImageMsg.style.display = 'none';
        originalInfoDiv.style.display = 'flex';
        origDimensionsSpan.innerText = `${originalWidth} x ${originalHeight}`;
        origSizeSpan.innerText = (originalFileSizeBytes / 1024).toFixed(2);
        currentImageElement = img;
        resetResultArea();
        if (!maxWidthInput.value && !maxHeightInput.value) {
            maxWidthInput.placeholder = `Orig width ${originalWidth}`;
            maxHeightInput.placeholder = `Orig height ${originalHeight}`;
        }
    };
    img.onerror = () => {
        showError('Failed to load image. Unsupported format or corrupted file.');
        revokePreviousImageURL();
        originalPreview.style.display = 'none';
        noImageMsg.style.display = 'block';
        originalInfoDiv.style.display = 'none';
        currentImageElement = null;
    };
    img.src = objectURL;
    return true;
}

/* ------------------------- CONVERSION & OUTPUT ------------------------- */
async function convertAndOptimize() {
    if (!currentImageElement || !currentImageElement.complete || currentImageElement.naturalWidth === 0) {
        showError('Please load a valid image first.');
        return;
    }
    errorMsgDiv.style.display = 'none';
    revokeOutputURL();

    const outputMime = outputFormatSelect.value;
    let quality = null;
    if (outputMime !== 'image/png') {
        quality = parseFloat(qualitySlider.value);
        if (isNaN(quality)) quality = 0.85;
        quality = Math.min(1, Math.max(0.1, quality));
    }

    let maxW = maxWidthInput.value.trim() === '' ? null : parseInt(maxWidthInput.value);
    let maxH = maxHeightInput.value.trim() === '' ? null : parseInt(maxHeightInput.value);
    if (maxW !== null && (isNaN(maxW) || maxW <= 0)) maxW = null;
    if (maxH !== null && (isNaN(maxH) || maxH <= 0)) maxH = null;

    const { width: targetWidth, height: targetHeight, resized } = calcNewDimensions(
        originalWidth, originalHeight, maxW, maxH
    );

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        showError('Canvas not supported by your browser.');
        return;
    }

    if (outputMime === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    try {
        ctx.drawImage(currentImageElement, 0, 0, targetWidth, targetHeight);
    } catch (err) {
        showError('Drawing error: ' + err.message);
        return;
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                reject(new Error('Conversion failed: format not supported.'));
                return;
            }
            const outputURL = URL.createObjectURL(blob);
            currentOutputBlobURL = outputURL;
            outputImage.src = outputURL;
            outputImage.style.display = 'block';
            const outputSizeKB = (blob.size / 1024).toFixed(2);
            const originalKB = (originalFileSizeBytes / 1024).toFixed(2);
            let savedPercent = ((1 - (blob.size / originalFileSizeBytes)) * 100).toFixed(1);
            if (savedPercent < 0) savedPercent = 0;
            let resizeNote = resized ? ` (resized to ${targetWidth}x${targetHeight})` : '';
            outputInfo.innerHTML = `
                New size: <strong class="glow-text">${outputSizeKB} KB</strong> | Original: ${originalKB} KB 
                <span style="color: #b1ffb1;">Savings: ${savedPercent}%</span> ${resizeNote}
            `;
            let ext = '.jpg';
            if (outputMime === 'image/png') ext = '.png';
            else if (outputMime === 'image/webp') ext = '.webp';
            let baseName = 'optimized_image';
            if (originalFileObj && originalFileObj.name) {
                baseName = originalFileObj.name.replace(/\.[^/.]+$/, '') + '_converted';
            }
            downloadLink.download = baseName + ext;
            downloadLink.href = outputURL;
            resultArea.style.display = 'block';
            resolve(true);
        }, outputMime, quality);
    }).catch(err => {
        showError('Output error: ' + err.message);
        resultArea.style.display = 'none';
    });
}

/* ------------------------- EVENT LISTENERS ------------------------- */
selectFileBtn.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#A855FF';
    uploadArea.style.background = 'rgba(168,85,255,0.1)';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'rgba(168, 85, 255, 0.5)';
    uploadArea.style.background = 'rgba(0,0,0,0.3)';
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(168, 85, 255, 0.5)';
    uploadArea.style.background = 'rgba(0,0,0,0.3)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImageFromFile(file);
    } else {
        showError('Dropped item is not a valid image.');
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) loadImageFromFile(e.target.files[0]);
});

outputFormatSelect.addEventListener('change', toggleQualityControl);

qualitySlider.addEventListener('input', updateQualitySlider);
updateQualitySlider();

toggleQualityControl();

convertBtn.addEventListener('click', async () => {
    if (!currentImageElement) {
        showError('Please select an image first.');
        return;
    }
    const originalText = convertBtn.innerText;
    convertBtn.innerText = 'Processing ...';
    convertBtn.disabled = true;
    try {
        await convertAndOptimize();
    } catch (e) {
        console.warn(e);
    } finally {
        convertBtn.innerText = originalText;
        convertBtn.disabled = false;
    }
});

window.addEventListener('beforeunload', () => {
    if (currentImageBlobURL) URL.revokeObjectURL(currentImageBlobURL);
    if (currentOutputBlobURL) URL.revokeObjectURL(currentOutputBlobURL);
});

/* :::::::::::::::::::::::::: HEIC SUPPORT OVERRIDE :::::::::::::::::::::::::: */
(function () {
    let isProcessingHeic = false;
    const originalLoadImage = window.loadImageFromFile;

    if (originalLoadImage) {
        window.loadImageFromFile = async function (file) {
            if (!file) return false;

            const isHeic = file.type === 'image/heic' ||
                           file.type === 'image/heif' ||
                           (file.name && (
                               file.name.toLowerCase().endsWith('.heic') ||
                               file.name.toLowerCase().endsWith('.heif')
                           ));

            if (isHeic && !isProcessingHeic) {
                isProcessingHeic = true;

                if (noImageMsg) {
                    noImageMsg.style.display = 'block';
                    noImageMsg.innerHTML = 'Processing HEIC image, please wait...';
                }
                if (originalPreview) originalPreview.style.display = 'none';

                try {
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: 'image/jpeg',
                        quality: 0.9
                    });

                    const convertedFile = new File(
                        [convertedBlob],
                        file.name.replace(/\.(heic|heif)$/i, '.jpg'),
                        { type: 'image/jpeg' }
                    );

                    const result = originalLoadImage(convertedFile);
                    isProcessingHeic = false;
                    return result;
                } catch (error) {
                    console.error('HEIC conversion failed:', error);
                    if (typeof showError === 'function') {
                        showError('Failed to convert HEIC image. The file might be corrupted or not supported.');
                    } else {
                        alert('Failed to convert HEIC image. The file might be corrupted or not supported.');
                    }
                    if (noImageMsg) {
                        noImageMsg.innerHTML = 'No image selected';
                    }
                    isProcessingHeic = false;
                    return false;
                }
            }

            return originalLoadImage(file);
        };
    } else {
        console.warn('Original loadImageFromFile not found. HEIC support may not be fully integrated.');
    }
})();

/* ------------------------- INITIAL STATE ------------------------- */
resetResultArea();