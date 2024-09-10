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



const toggleFlip = (event) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    const nftItem = event.currentTarget.closest('.nft-item');
    nftItem.classList.toggle('flip');
};

// Run functions after the window has loaded
window.onload = () => {
    displayNFTs(); // Ensure this function is defined in your app.js to display NFTs
    addZoomEffect(); // Apply zoom and blur effects to NFT items
    handleFooterVisibility(); // Manage footer visibility based on scroll position
};
