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


// Run functions after the window has loaded
window.onload = () => {
    displayNFTs(); // Ensure this function is defined in your app.js
    addZoomEffect(); // Add zoom effect
};
