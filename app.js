// Replace with your Alchemy API Key
const apiKey = "V02Btj6wPHcO9W5SYKk5cocTEli93zbV";

// Define your wallet addresses here
const walletAddresses = [
    '0x4bBB452a380A73E8c969055A23d71AB4487c32AD',
    '0x939A9353e1a72e5d6Da07424c74815a6651a86f4' // Replace with your wallet address
];

// Convert IPFS URL to HTTP URL
const convertIPFSUrl = (ipfsUrl) => {
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

// Fetch NFTs from Alchemy API for a given chain with retry logic
const fetchNFTs = async (chain, walletAddress, retries = 3) => {
    const apiUrl = chain === 'ethereum'
        ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`
        : `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;
    
    try {
        const response = await fetch(apiUrl);

        // Check if response status is 429 (Rate Limit Exceeded)
        if (response.status === 429) {
            if (retries > 0) {
                console.warn(`Rate limit exceeded. Retrying ${retries} more times...`);
                // Wait for a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
                return fetchNFTs(chain, walletAddress, retries - 1);
            } else {
                throw new Error('Rate limit exceeded. No retries left.');
            }
        }

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

// Function to display NFTs
const displayNFTsForChainAndWallet = async (chain, walletAddress, gallery) => {
    const nfts = await fetchNFTs(chain, walletAddress);
    const filters = await loadFilters();

    // Filter out spam NFTs
    const filteredNFTs = nfts.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));



    // Display each NFT
    filteredNFTs.forEach(nft => {
        const metadata = nft.metadata || {};
        const imageUrl = convertIPFSUrl(metadata.image || '');
        const name = metadata.name || 'Unknown';
        const description = metadata.description || 'No description';

        const nftElement = document.createElement('div');
        nftElement.className = 'nft-item';

        nftElement.innerHTML = `
            <div class="top-bar">
                <p class="metadata-title">${name}</p>
                <p class="metadata-blockchain">${chain.charAt(0).toUpperCase() + chain.slice(1)}</p>
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
};

// Function to fetch and display NFTs from all wallet addresses and chains
const displayNFTs = async () => {
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = ''; // Clear previous content

    // Loop through each wallet address and blockchain
    for (const walletAddress of walletAddresses) {
        // Display Ethereum NFTs
        await displayNFTsForChainAndWallet('ethereum', walletAddress, gallery);

        // Display Polygon NFTs
        await displayNFTsForChainAndWallet('polygon', walletAddress, gallery);
    }
};

// Load the NFTs when the page loads
window.onload = displayNFTs;
