document.addEventListener('DOMContentLoaded', () => {
    // Create and append the loading message element
    const loadingMessage = document.createElement('div');
    loadingMessage.id = 'loading-message';
    loadingMessage.innerText = 'Loading...';
    document.body.appendChild(loadingMessage);

    // Function to check if all images are loaded
    const checkImagesLoaded = () => {
        const images = document.querySelectorAll('img');
        const totalImages = images.length;
        let loadedImages = 0;

        // Event handler for each image
        const imageLoadHandler = () => {
            loadedImages += 1;
            if (loadedImages === totalImages) {
                // All images are loaded
                loadingMessage.style.display = 'none'; // Hide loading message
            }
        };

        // Attach load event handler to each image
        images.forEach(image => {
            if (image.complete) {
                imageLoadHandler(); // Image already loaded
            } else {
                image.addEventListener('load', imageLoadHandler);
                image.addEventListener('error', imageLoadHandler); // Handle errors as well
            }
        });

        // Check if there are no images on the page
        if (totalImages === 0) {
            loadingMessage.style.display = 'none';
        }
    };

    // Observe for changes in the gallery to detect newly added images
    const observer = new MutationObserver(() => {
        checkImagesLoaded(); // Re-check images when mutations occur
    });

    // Observe changes in the body to handle dynamically added content
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial check on page load
    checkImagesLoaded();
});
