const imageUpload = document.getElementById('image-upload');
const cropOverlay = document.getElementById('crop-overlay');
const resizeHandle = document.getElementById('resize-handle');
const cropButton = document.getElementById('crop-button');
const image = document.getElementById('image');
const croppedImagesRow = document.getElementById('cropped-images-row');
const croppedImagesGrid = document.getElementById('cropped-images-grid');
const reload6x6Button = document.getElementById('reload-6x6');
const reload5x5Button = document.getElementById('reload-5x5');
const reload4x4Button = document.getElementById('reload-4x4');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

let isDragging = false;
let isResizing = false;
let startX, startY, startWidth, startHeight;
let croppedImages = [];

// Handle image upload
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            image.src = event.target.result;
            image.onload = function() {
                // Reset crop area when new image is loaded
                cropOverlay.style.width = '100px';
                cropOverlay.style.height = '100px';
                cropOverlay.style.left = '50px';
                cropOverlay.style.top = '50px';
            };
        };
        reader.readAsDataURL(file);
    }
});

// Handle mouse drag events
cropOverlay.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - cropOverlay.offsetLeft;
    startY = e.clientY - cropOverlay.offsetTop;
});

// Handle mouse move events
document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const containerRect = cropOverlay.parentElement.getBoundingClientRect();
        const newLeft = Math.min(
            Math.max(e.clientX - startX, 0),
            containerRect.width - cropOverlay.offsetWidth
        );
        const newTop = Math.min(
            Math.max(e.clientY - startY, 0),
            containerRect.height - cropOverlay.offsetHeight
        );

        cropOverlay.style.left = `${newLeft}px`;
        cropOverlay.style.top = `${newTop}px`;
    } else if (isResizing) {
        const containerRect = cropOverlay.parentElement.getBoundingClientRect();
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const delta = Math.max(deltaX, deltaY);

        const newSize = Math.min(
            Math.max(50, startWidth + delta),
            containerRect.width - cropOverlay.offsetLeft,
            containerRect.height - cropOverlay.offsetTop
        );

        cropOverlay.style.width = `${newSize}px`;
        cropOverlay.style.height = `${newSize}px`;
    }
});

// Handle mouse up events
document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
});

// Handle touch drag events for mobile
cropOverlay.addEventListener('touchstart', (e) => {
    e.preventDefault();
    console.log("touchstart target: " + e.target)
    console.log("touchstart target: " + e.target + " id" + e.target.id)
    if (e.target.id != "crop-overlay") return;
    isDragging = true;
    startX = e.touches[0].clientX - cropOverlay.offsetLeft;
    startY = e.touches[0].clientY - cropOverlay.offsetTop;
});

// Handle touch move events for mobile
document.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const containerRect = cropOverlay.parentElement.getBoundingClientRect();
        const newLeft = Math.min(
            Math.max(e.touches[0].clientX - startX, 0),
            containerRect.width - cropOverlay.offsetWidth
        );
        const newTop = Math.min(
            Math.max(e.touches[0].clientY - startY, 0),
            containerRect.height - cropOverlay.offsetHeight
        );

        cropOverlay.style.left = `${newLeft}px`;
        cropOverlay.style.top = `${newTop}px`;
    } else if (isResizing) {
        const containerRect = cropOverlay.parentElement.getBoundingClientRect();
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        const delta = Math.max(deltaX, deltaY);

        const newSize = Math.min(
            Math.max(50, startWidth + delta),
            containerRect.width - cropOverlay.offsetLeft,
            containerRect.height - cropOverlay.offsetTop
        );

        cropOverlay.style.width = `${newSize}px`;
        cropOverlay.style.height = `${newSize}px`;
    }
});

// Handle touch end events for mobile
document.addEventListener('touchend', (e) => {
    //e.preventDefault();
    isDragging = false;
    isResizing = false;
});

// Handle resize events
resizeHandle.addEventListener('mousedown', (e) => {
    e.stopPropagation();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = cropOverlay.offsetWidth;
    startHeight = cropOverlay.offsetHeight;
});

// Handle resize touch events for mobile
resizeHandle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startWidth = cropOverlay.offsetWidth;
    startHeight = cropOverlay.offsetHeight;
});

// Handle cropping
cropButton.addEventListener('click', () => {
    const imageRect = image.getBoundingClientRect();
    const overlayRect = cropOverlay.getBoundingClientRect();

    const scaleX = image.naturalWidth / imageRect.width;
    const scaleY = image.naturalHeight / imageRect.height;

    const cropX = (overlayRect.left - imageRect.left) * scaleX;
    const cropY = (overlayRect.top - imageRect.top) * scaleY;
    const cropWidth = overlayRect.width * scaleX;
    const cropHeight = overlayRect.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
    );

    const croppedImage = canvas.toDataURL('image/png');
    croppedImages.push(croppedImage);
    displayCroppedImage(croppedImage);
});

// Display cropped image in a row
function displayCroppedImage(dataURL) {
    const croppedItem = document.createElement('div');
    croppedItem.className = 'cropped-item-row';

    const img = document.createElement('img');
    img.src = dataURL;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        croppedItem.remove();
        croppedImages = croppedImages.filter((src) => src !== dataURL);
    });

    croppedItem.appendChild(img);
    croppedItem.appendChild(removeButton);
    croppedImagesRow.appendChild(croppedItem);
}

// Reload images into a grid
function reloadGrid(rows, cols) {
    const totalCells = rows * cols;
    const gridImages = [];

    for (let i = 0; i < totalCells; i++) {
        const randomIndex = Math.floor(Math.random() * croppedImages.length);
        gridImages.push(croppedImages[randomIndex]);
    }

    croppedImagesGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    displayGrid(gridImages);
}

// Display images in the grid
function displayGrid(gridImages) {
    croppedImagesGrid.innerHTML = ''; // Clear the grid
    gridImages.forEach((imageSrc) => {
        const croppedItem = document.createElement('div');
        croppedItem.className = 'cropped-item-grid';

        const img = document.createElement('img');
        img.src = imageSrc;

        croppedItem.appendChild(img);
        croppedImagesGrid.appendChild(croppedItem);
    });
}

// Event listeners for grid reload buttons
reload6x6Button.addEventListener('click', () => reloadGrid(6, 6));
reload5x5Button.addEventListener('click', () => reloadGrid(5, 5));
reload4x4Button.addEventListener('click', () => reloadGrid(4, 4));
