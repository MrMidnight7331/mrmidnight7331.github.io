// Assuming styles.js handles styles, effects, and theme toggling

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
// Function to handle footer visibility
const handleFooterVisibility = () => {
    const footer = document.querySelector('footer');
    if (!footer) {
        console.error('Footer element not found');
        return;
    }

    const checkScrollPosition = () => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollPosition >= documentHeight - 10) { // Small buffer to trigger at the bottom
            footer.style.opacity = '1';
            footer.style.transform = 'translateY(0)';
        } else {
            footer.style.opacity = '0';
            footer.style.transform = 'translateY(100%)';
        }
    };

    // Initial check
    checkScrollPosition();

    // Add scroll event listener
    window.addEventListener('scroll', checkScrollPosition);

    // Optionally, handle window resize
    window.addEventListener('resize', checkScrollPosition);
};

// Call the function on page load
window.addEventListener('load', handleFooterVisibility);

// Function to set a cookie with an expiration date
const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Set expiration in days
    const expires = "expires=" + date.toUTCString(); 
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

// Function to get a cookie value by name
const getCookie = (name) => {
    const nameEQ = name + "=";
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length, cookie.length);
    }
    return null;
};

// Function to toggle between light and dark mode
const toggleTheme = () => {
    const body = document.body;
    const sunMoonIcon = document.getElementById('theme-toggle').querySelector('.sun-moon-icon');

    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        sunMoonIcon.textContent = '☀️'; // Change to sun icon for dark mode
        setCookie('theme', 'dark', 365); // Set cookie with a 365-day expiration
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        sunMoonIcon.textContent = '🌙'; // Change to moon icon for light mode
        setCookie('theme', 'light', 365); // Set cookie with a 365-day expiration
    }
};

// Apply the user's stored theme on page load
const applyStoredTheme = () => {
    const storedTheme = getCookie('theme');
    const body = document.body;
    const sunMoonIcon = document.getElementById('theme-toggle').querySelector('.sun-moon-icon');

    if (storedTheme === 'dark') {
        body.classList.add('dark-mode');
        sunMoonIcon.textContent = '☀️'; // Sun icon for dark mode
    } else if (storedTheme === 'light') {
        body.classList.add('light-mode');
        sunMoonIcon.textContent = '🌙'; // Moon icon for light mode
    }
};

// Call applyStoredTheme on page load to persist the theme
document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
});

// Event listener for theme toggle button
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);


// Run additional functions after the window has loaded
window.onload = () => {
    addZoomEffect(); // Apply zoom and blur effects to NFT items
    handleFooterVisibility(); // Manage footer visibility based on scroll position
};

console.log('styles.js loaded successfully!'); // Debugging line
