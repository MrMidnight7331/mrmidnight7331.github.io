

// Function to handle footer visibility
// Attach event listeners for hover effects
const addHoverEffect = () => {
    const nftImages = document.querySelectorAll('.nft-image');
    
    nftImages.forEach(image => {
        image.addEventListener('mouseover', () => {
            image.style.transform = 'scale(1.1)';
            image.style.zIndex = '10';
        });

        image.addEventListener('mouseout', () => {
            image.style.transform = 'scale(1)';
            image.style.zIndex = '1';
        });
    });
};

// Function to handle footer visibility
const handleFooterVisibility = () => {
    const footer = document.querySelector('footer');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY + window.innerHeight < document.body.scrollHeight - 100) {
            footer.classList.remove('hidden');
        } else {
            footer.classList.add('hidden');
        }
    });
};

// Run functions after the window has loaded
window.onload = () => {
    displayNFTs(); // Ensure this function is defined in your app.js
    addHoverEffect();
    handleFooterVisibility();
};




