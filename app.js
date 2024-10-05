// Function to fetch configuration from config.json
const fetchConfig = async () => {
    try {
        const response = await fetch('configs/config.json');
        const config = await response.json();
        console.log('Config loaded:', config);
        return config;
    } catch (error) {
        console.error('Error loading configuration:', error);
        return { username: 'DefaultUser', walletAddresses: [], apiKey: '', roninKey: '' };
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
// Function to dynamically extract attributes for Ronin NFTs (Sidekicks, Pets, etc.), excluding links and assets
const getRoninAttributes = (metadata) => {
    const attributes = [];

    // Check if the metadata has properties
    if (metadata.properties) {
        // Loop through each property dynamically and add to attributes array
        for (const [key, value] of Object.entries(metadata.properties)) {
            if (typeof value === 'object' && value !== null) {
                // If the value is an object (like assets in Sidekicks), loop through inner properties
                for (const [innerKey, innerValue] of Object.entries(value)) {
                    // Exclude URLs from attributes
                    if (typeof innerValue === 'string' && !innerValue.startsWith('http')) {
                        attributes.push(`${key.charAt(0).toUpperCase() + key.slice(1)} ${innerKey}: ${innerValue}`);
                    }
                }
            } else {
                // Exclude URLs from attributes
                if (typeof value === 'string' && !value.startsWith('http')) {
                    attributes.push(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
                }
            }
        }
    }

    // Check if the metadata has a more traditional attributes array (for example, Pets)
    if (metadata.attributes) {
        metadata.attributes.forEach(attr => {
            attributes.push(`${attr.trait_type}: ${attr.value}`);
        });
    }

    return attributes.length > 0 ? attributes.join('<br>') : 'No attributes available';
};


// Fetch NFTs from Ronin API with retry logic
const fetchRoninNFTs = async (walletAddress, apiKey, retries = 3) => {
    const apiUrl = `https://api-gateway.skymavis.com/skynet/ronin/web3/v2/accounts/${walletAddress}/nfts?limit=2`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': apiKey
            }
        });

        const textResponse = await response.text(); // Get raw text response for debugging

        // Check if response status is 429 (Rate Limit Exceeded)
        if (response.status === 429) {
            if (retries > 0) {
                console.warn(`Ronin rate limit exceeded. Retrying ${retries} more times...`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
                return fetchRoninNFTs(walletAddress, apiKey, retries - 1);
            } else {
                throw new Error('Ronin rate limit exceeded. No retries left.');
            }
        }

        const data = JSON.parse(textResponse);

        // Log the entire response for debugging
        console.log('Ronin API Response:', data);

        // Check if the expected result field exists and contains items
        if (!data || !data.result || !data.result.items) {
            console.error('Invalid Ronin API response structure:', data);
            return [];  // Return an empty array if the structure is unexpected
        }

        console.log('Fetched Ronin NFTs:', data.result.items);
        return data.result.items || [];
    } catch (error) {
        console.error('Error fetching Ronin NFTs:', error);
        return [];
    }
};



// Function to shorten the address
const shortenAddress = (address) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
};

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
    let nfts = [];

    if (chain === 'ronin') {
        nfts = await fetchRoninNFTs(walletAddress, apiKey);
    } else {
        nfts = await fetchNFTs(chain, walletAddress, apiKey);
    }

    const filters = await loadFilters();

    // Filter out spam NFTs
    const filteredNFTs = nfts.filter(nft => !isFiltered(nft.metadata?.name || '', nft.metadata?.description || '', filters));

    // Display each NFT
    filteredNFTs.forEach(nft => {
        const metadata = nft.metadata || {};
        const contractAddress = nft.contractAddress || nft.contract?.address || '';  // Handle Ronin and other chains
        const imageUrl = chain === 'ronin' ? metadata.image : convertIPFSUrl(metadata.image || '');
        const name = metadata.name || 'Unknown';
        const description = metadata.description || 'No description';
        const shortenedContractAddress = shortenAddress(contractAddress);
        const explorerUrl = chain === 'ronin' ? '#' : getExplorerUrl(chain, contractAddress);

        // Extract attributes dynamically for Ronin
        const attributes = chain === 'ronin' ? getRoninAttributes(metadata) : metadata.attributes
            ? metadata.attributes.map(attr => `${attr.trait_type}: ${attr.value}`).join('<br>')
            : 'No attributes available';

        // Add additional details: Floor Price, Total Supply, and Token Type only if available
        const floorPrice = nft.contractMetadata?.openSea?.floorPrice && nft.contractMetadata.openSea.floorPrice !== 'Not available'
            ? `<p><strong>Floor Price:</strong> ${nft.contractMetadata.openSea.floorPrice} ETH</p>`
            : '';

        const totalSupply = nft.contractMetadata?.totalSupply && nft.contractMetadata.totalSupply !== 'Unknown'
            ? `<p><strong>Total Supply:</strong> ${nft.contractMetadata.totalSupply}</p>`
            : '';

        const tokenType = nft.id?.tokenMetadata?.tokenType && nft.id.tokenMetadata.tokenType !== 'Unknown'
            ? `<p><strong>Token Type:</strong> ${nft.id.tokenMetadata.tokenType}</p>`
            : '';

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
                    ${floorPrice}
                    ${totalSupply}
                    ${tokenType}
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



// Function to handle index.html page
const handleIndexPage = async () => {
    const gallery = document.getElementById('nft-gallery');
    gallery.innerHTML = ''; // Clear previous content

    // Fetch configuration
    const config = await fetchConfig();
    const walletAddresses = config.walletAddresses;
    const username = config.username;
    const apiKey = config.apiKey;
    const roninKey = config.roninKey;

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
        await displayNFTsForChainAndWallet('base', walletAddress, apiKey, gallery);

        // Display Ronin NFTs
        await displayNFTsForChainAndWallet('ronin', walletAddress, roninKey, gallery);
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
