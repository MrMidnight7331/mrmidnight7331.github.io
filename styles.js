// Function to handle zoom and blur effects
const addZoomEffect = () => {
    const nftItems = document.querySelectorAll('.nft-item');
    const body = document.body;

    nftItems.forEach(item => {
        const image = item.querySelector('.nft-image');

        image.addEventListener('mouseover', () => {
            item.classList.add('zoomed');
            body.classList.add('blur');
        });

        image.addEventListener('mouseout', () => {
            item.classList.remove('zoomed');
            body.classList.remove('blur');
        });
    });
};

// Function to handle footer visibility
const handleFooterVisibility = () => {
    const footer = document.querySelector('footer');

    const checkScrollPosition = () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;

        if (scrollPosition >= documentHeight) {
            footer.style.opacity = '1';
            footer.style.transform = 'translateY(0)';
        } else {
            footer.style.opacity = '0';
            footer.style.transform = 'translateY(100%)';
        }
    };

    // Initial check
    checkScrollPosition();

    // Attach scroll event listener
    window.addEventListener('scroll', checkScrollPosition);
};

// Run functions after the window has loaded
window.onload = () => {
    displayNFTs(); // Ensure this function is defined in your app.js
    addZoomEffect(); // Add zoom effect
    handleFooterVisibility(); // Handle footer visibility
};
