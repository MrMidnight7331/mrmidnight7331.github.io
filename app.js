// Replace with your Alchemy API Key
const apiKey = "V02Btj6wPHcO9W5SYKk5cocTEli93zbV";

// Fetch configuration from config.json
const fetchConfig = async () => {
    try {
        const response = await fetch('configs/config.json');
        const config = await response.json();
        console.log('Config loaded:', config);
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        return { username: 'DefaultUser', walletAddresses: [] };
    }
};


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
        console.log('API response:', await response.clone().json()); // Log the response for debugging

        // Check if response status is 429 (Rate Limit Exceeded)
        if (response.status === 429) {
            if (retries > 0) {
                console.warn(`Rate limit exceeded. Retrying ${retries} more times...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
                return fetchNFTs(chain, walletAddress, retries - 1);
            } else {
                throw new Error('Rate limit exceeded. No retries left.');
            }
        }

        const data = await response.json();
        
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
        const response = await fetch('./configs/filter.json');
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

// Function to shorten the wallet address
const shortenAddress = (address) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
};

const getExplorerUrl = (chain, address) => {
    const baseUrls = {
        ethereum: 'https://etherscan.io/address/',
        polygon: 'https://polygonscan.com/address/'
    };
    return baseUrls[chain] + address;
};

// Function to display NFTs
const displayNFTsForChainAndWallet = async (chain, walletAddress, gallery) => {
    const nfts = await fetchNFTs(chain, walletAddress);
    const filters = await loadFilters();
    const shortenedAddress = shortenAddress(walletAddress);

    // Filter out spam NFTs
    const filteredNFTs = nfts.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));

    // Display each NFT
    filteredNFTs.forEach(nft => {
        const metadata = nft.metadata || {};
        const imageUrl = convertIPFSUrl(metadata.image || '');
        const name = metadata.name || 'Unknown';
        const description = metadata.description || 'No description';
        const explorerUrl = getExplorerUrl(chain, walletAddress);

        const nftElement = document.createElement('div');
        nftElement.className = 'nft-item';

        nftElement.innerHTML = `
            <div class="top-bar">
                <p class="metadata-title">${name}</p>
                <p class="metadata-blockchain">
                    <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">${shortenedAddress} : ${chain.charAt(0).toUpperCase() + chain.slice(1)}</a>
                </p>
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

    // Fetch configuration
    const config = await fetchConfig();
    const walletAddresses = config.walletAddresses;
    const username = config.username;

    // Update the page with the username
    document.getElementById('header-title').textContent = `${username}'s NFT Gallery`;
    document.getElementById('page-title').textContent = `${username}'s NFT Gallery`;

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
