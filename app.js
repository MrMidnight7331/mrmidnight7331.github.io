// Replace with your Alchemy API Key
const apiKey = "V02Btj6wPHcO9W5SYKk5cocTEli93zbV";

// Define your wallet addresses here
const walletAddresses = [
    '0x4bBB452a380A73E8c969055A23d71AB4487c32AD' // Replace with your wallet address
];

// Convert IPFS URL to HTTP URL
const convertIPFSUrl = (ipfsUrl) => {
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

// Fetch NFTs from Alchemy API for a given chain
const fetchNFTs = async (chain, walletAddress) => {
    try {
        const apiUrl = chain === 'ethereum'
            ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`
            : `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Check for data or errors
        if (!data || data.error) {
            console.error(`Error fetching NFTs from ${chain}:`, data.error);
            return [];
        }
        
        console.log(`Fetched NFTs from ${chain}:`, data);
        return data.ownedNfts || [];
    } catch (error) {
        console.error(`Error fetching NFTs from ${chain}:`, error);
        return [];
    }
};

// Load and parse filter.json
const loadFilters = async () => {
    try {
        const response = await fetch('filter.json');
        const data = await response.json();
        return data.words || [];
    } catch (error) {
        console.error('Error loading filters:', error);
        return [];
    }
};

// Check if an NFT's title or description contains any of the filtered words
const isFiltered = (title, description, filters) => {
    const text = (title + ' ' + description).toLowerCase();
    return filters.some(word => text.includes(word.toLowerCase()));
};

// Function to fetch and display NFTs from all wallet addresses and chains
const displayNFTs = async () => {
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = ''; // Clear previous content

    const filters = await loadFilters();

    // Loop through each wallet address
    for (const walletAddress of walletAddresses) {
        // Fetch NFTs from Ethereum
        const ethNFTs = await fetchNFTs('ethereum', walletAddress);
        // Fetch NFTs from Polygon
        const polygonNFTs = await fetchNFTs('polygon', walletAddress);

        // Filter out spam NFTs
        const filteredEthNFTs = ethNFTs.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));
        const filteredPolygonNFTs = polygonNFTs.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));

        if (filteredEthNFTs.length === 0 && filteredPolygonNFTs.length === 0) {
            gallery.innerHTML += '<p>No NFTs found.</p>';
            continue;
        }

        // Add title for Ethereum NFTs
        if (filteredEthNFTs.length > 0) {
            gallery.innerHTML += '<h2>Ethereum NFTs</h2>';
        }

        // Display each Ethereum NFT
        filteredEthNFTs.forEach(nft => {
            const metadata = nft.metadata || {};
            const imageUrl = convertIPFSUrl(metadata.image || '');
            const name = metadata.name || 'Unknown';
            const blockchain = 'Ethereum';
            const description = metadata.description || 'No description';

            const nftElement = document.createElement('div');
            nftElement.className = 'nft-item';

            nftElement.innerHTML = `
                <div class="top-bar">
                    <p class="metadata-title">${name}</p>
                    <p class="metadata-blockchain">${blockchain}</p>
                </div>
                <div class="image-container">
                    <img src="${imageUrl}" alt="${name}" class="nft-image">
                </div>
                <div class="description-container">
                    <p class="description-text">${description}</p>
                </div>
            `;

            gallery.appendChild(nftElement);
        });

        // Add title for Polygon NFTs
        if (filteredPolygonNFTs.length > 0) {
            gallery.innerHTML += '<h2>Polygon NFTs</h2>';
        }

        // Display each Polygon NFT
        filteredPolygonNFTs.forEach(nft => {
            const metadata = nft.metadata || {};
            const imageUrl = convertIPFSUrl(metadata.image || '');
            const name = metadata.name || 'Unknown';
            const blockchain = 'Polygon';
            const description = metadata.description || 'No description';

            const nftElement = document.createElement('div');
            nftElement.className = 'nft-item';

            nftElement.innerHTML = `
                <div class="top-bar">
                    <p class="metadata-title">${name}</p>
                    <p class="metadata-blockchain">${blockchain}</p>
                </div>
                <div class="image-container">
                    <img src="${imageUrl}" alt="${name}" class="nft-image">
                </div>
                <div class="description-container">
                    <p class="description-text">${description}</p>
                </div>
            `;

            gallery.appendChild(nftElement);
        });
    }
};

// Load the NFTs when the page loads
window.onload = displayNFTs;


