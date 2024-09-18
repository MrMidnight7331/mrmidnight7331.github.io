// Function to fetch configuration from config.json
const fetchConfig = async () => {
    try {
        const response = await fetch('configs/config.json');
        const config = await response.json();
        console.log('Config loaded:', config);
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        return { username: 'DefaultUser', walletAddresses: [], apiKey: '' };
    }
};

// Convert IPFS URL to HTTP URL
const convertIPFSUrl = (ipfsUrl) => {
    if (ipfsUrl.startsWith('ipfs://')) {
        return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return ipfsUrl;
};

// Load and parse filter.json
const loadFilters = async () => {
    try {
        const response = await fetch('configs/filter.json');
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

// Fetch NFTs from Alchemy API for a given chain with retry logic
// Fetch NFTs from Alchemy API for a given chain with retry logic
const fetchNFTs = async (chain, walletAddress, apiKey, retries = 3) => {
    const apiUrl = chain === 'ethereum'
        ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`
        : chain === 'polygon'
        ? `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`
        : `https://base-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;

    try {
        const response = await fetch(apiUrl);
        const textResponse = await response.text(); // Get raw text response for debugging

        // Check if response status is 429 (Rate Limit Exceeded)
        if (response.status === 429) {
            if (retries > 0) {
                console.warn(`Rate limit exceeded. Retrying ${retries} more times...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
                return fetchNFTs(chain, walletAddress, apiKey, retries - 1);
            } else {
                throw new Error('Rate limit exceeded. No retries left.');
            }
        }

        try {
            const data = JSON.parse(textResponse); // Parse the text response as JSON
            if (!data || data.error) {
                console.error(`Error fetching NFTs from ${chain}:`, data.error);
                return [];
            }
            console.log(`Fetched NFTs from ${chain}:`, data);
            return data.ownedNfts || [];
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching NFTs from ${chain}:`, error);
        return [];
    }
};


// Function to shorten the address
const shortenAddress = (address) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
};

// Function to get explorer URL (Etherscan/Polygonscan)
// Function to get explorer URL (Etherscan/Polygonscan/Base explorer)
const getExplorerUrl = (chain, address) => {
    const baseUrls = {
        ethereum: 'https://etherscan.io/address/',
        polygon: 'https://polygonscan.com/address/',
        base: 'https://basescan.org/address/'  // Base explorer
    };
    return baseUrls[chain] + address;
};


// Function to display NFTs for a single wallet
const displayNFTsForChainAndWallet = async (chain, walletAddress, apiKey, gallery) => {
    const nfts = await fetchNFTs(chain, walletAddress, apiKey);
    const filters = await loadFilters();

    // Filter out spam NFTs
    const filteredNFTs = nfts.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));

    // Display each NFT
    filteredNFTs.forEach(nft => {
        const metadata = nft.metadata || {};
        const contractAddress = nft.contract.address || '';
        const imageUrl = convertIPFSUrl(metadata.image || '');
        const name = metadata.name || 'Unknown';
        const description = metadata.description || 'No description';
        const shortenedContractAddress = shortenAddress(contractAddress);
        const explorerUrl = getExplorerUrl(chain, contractAddress);

        // Extract additional data for the backside
        const floorPrice = nft.contractMetadata?.openSea?.floorPrice ? `${nft.contractMetadata.openSea.floorPrice} ETH` : 'Not available';
        const totalSupply = nft.contractMetadata?.totalSupply || 'Unknown';
        const tokenType = nft.id.tokenMetadata?.tokenType || 'Unknown';
        const attributes = metadata.attributes
            ? metadata.attributes.map(attr => `${attr.trait_type}: ${attr.value}`).join('<br>')
            : 'No attributes available';

        const nftElement = document.createElement('div');
        nftElement.className = 'nft-item';

        nftElement.innerHTML = `
            <div class="nft-front">
                <div class="top-bar">
                    <p class="metadata-title">${name}</p>
                    <p class="metadata-blockchain">
                        <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer">${shortenedContractAddress} : ${chain.charAt(0).toUpperCase() + chain.slice(1)}</a>
                    </p>
                </div>
                <div class="image-container">
                    <img src="${imageUrl}" alt="${name}" class="nft-image">
                </div>
                <div class="description-container">
                    <p class="description-text">${description}</p>
                </div>
                <div class="three-dots" onclick="toggleFlip(event)">
                    <span class="middle-dot"></span>
                </div>
            </div>
            <div class="nft-back">
                <div class="back-content">
                    <p><strong>Floor Price:</strong> ${floorPrice}</p>
                    <p><strong>Total Supply:</strong> ${totalSupply}</p>
                    <p><strong>Token Type:</strong> ${tokenType}</p>
                    <p><strong>Attributes:</strong><br>${attributes}</p>
                </div>
                <div class="three-dots" onclick="toggleFlip(event)">
                    <span class="middle-dot"></span>
                </div>
            </div>
        `;

        gallery.appendChild(nftElement);
    });
};

// Function to toggle the flip effect on the NFT card

// Function to handle index.html page
const handleIndexPage = async () => {
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = ''; // Clear previous content

    // Fetch configuration
    const config = await fetchConfig();
    const walletAddresses = config.walletAddresses;
    const username = config.username;
    const apiKey = config.apiKey;

    // Update the page with the username
    document.getElementById('header-title').textContent = `${username}'s NFT Gallery`;
    document.getElementById('page-title').textContent = `${username}'s NFT Gallery`;

    // Loop through each wallet address and blockchain
    for (const walletAddress of walletAddresses) {
        // Display Ethereum NFTs
        await displayNFTsForChainAndWallet('ethereum', walletAddress, apiKey, gallery);

        // Display Polygon NFTs
        await displayNFTsForChainAndWallet('polygon', walletAddress, apiKey, gallery);

        // Display Base NFTs
        await displayNFTsForChainAndWallet('base', walletAddress, apiKey, gallery);  // Added Base support
    }
};


// Function to handle search.html page
const handleSearchPage = async () => {
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = ''; // Clear previous content

    const apiKey = (await fetchConfig()).apiKey; // Get API key from config

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', async () => {
        const addressInput = document.getElementById('address-input');
        const walletAddress = addressInput.value.trim();
        if (walletAddress) {
            // Display Ethereum NFTs
            await displayNFTsForChainAndWallet('ethereum', walletAddress, apiKey, gallery);

            // Display Polygon NFTs
            await displayNFTsForChainAndWallet('polygon', walletAddress, apiKey, gallery);
        } else {
            alert('Please enter a valid Ethereum address.');
        }
    });
};

// Determine which page is being loaded and call the appropriate function
window.onload = () => {
    if (document.getElementById('search-page')) {
        handleSearchPage();
    } else {
        handleIndexPage();
    }
};
