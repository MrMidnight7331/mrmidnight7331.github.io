// Assuming styles.js only handles styles and effects related to CSS

// Function to handle zoom and blur effects
const addZoomEffect = () => {
    const nftItems = document.querySelectorAll('.nft-item');
    const body = document.body;

    nftItems.forEach(item => {
        const image = item.querySelector('.nft-image');

        // Add zoom and blur on mouse over
        image.addEventListener('mouseover', () => {
            item.classList.add('zoomed'); // Add zoom effect to NFT item
            body.classList.add('blur'); // Add blur effect to the body
        });

        // Remove zoom and blur on mouse out
        image.addEventListener('mouseout', () => {
            item.classList.remove('zoomed'); // Remove zoom effect from NFT item
            body.classList.remove('blur'); // Remove blur effect from the body
        });
    });
};

const handleFooterVisibility = () => {
    const footer = document.querySelector('footer');
    if (!footer) {
        console.error('Footer element not found');
        return;
    }

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

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition);
};

// Directly test if the footer visibility works correctly
handleFooterVisibility();


// Run functions after the window has loaded
window.onload = () => {
    addZoomEffect(); // Apply zoom and blur effects to NFT items
    handleFooterVisibility(); // Manage footer visibility based on scroll position
};

console.log('styles.js loaded successfully!'); // Debugging line
