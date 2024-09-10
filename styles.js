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

// Function to handle footer visibility
const handleFooterVisibility = () => {
    const footer = document.querySelector('footer');

    const checkScrollPosition = () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.offsetHeight;

        if (scrollPosition >= documentHeight) {
            footer.style.opacity = '1'; // Make footer visible
            footer.style.transform = 'translateY(0)'; // Slide up the footer
        } else {
            footer.style.opacity = '0'; // Hide footer smoothly
            footer.style.transform = 'translateY(100%)'; // Slide down the footer smoothly
        }
    };

    // Initial check to hide the footer before scrolling
    checkScrollPosition();

    // Attach scroll event listener
    window.addEventListener('scroll', checkScrollPosition);
};

// Function to handle flipping NFT cards
const toggleFlip = (event) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    const nftItem = event.currentTarget.closest('.nft-item');
    nftItem.classList.toggle('flip'); // Toggle flip class to rotate the card
};

// Run functions after the window has loaded
window.onload = () => {
    displayNFTs(); // Ensure this function is defined in your app.js to display NFTs
    addZoomEffect(); // Apply zoom and blur effects to NFT items
    handleFooterVisibility(); // Manage footer visibility based on scroll position
};
