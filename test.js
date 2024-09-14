// Store the API key and wallet addresses in variables
const apiKey = 'V02Btj6wPHcO9W5SYKk5cocTEli93zbV';
const walletAddresses = [
    '0x4bBB452a380A73E8c969055A23d71AB4487c32AD',
    '0x939A9353e1a72e5d6Da07424c74815a6651a86f4'
];

// Fetch NFTs from Alchemy API and return raw response
const fetchNFTs = async (chain, walletAddress) => {
    const apiUrl = chain === 'ethereum'
        ? `https://eth-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`
        : `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}/getNFTsForOwner?owner=${walletAddress}&withMetadata=true`;

    try {
        const response = await fetch(apiUrl);
        const rawData = await response.text(); // Get the raw response as plain text
        console.log(rawData); // Output the raw response
        return rawData;
    } catch (error) {
        console.error(`Error fetching NFTs from ${chain}:`, error);
        return null;
    }
};

// Test function to fetch and log raw NFT data
const testFetchAndLogNFTs = async () => {
    // Loop through each wallet address and fetch NFTs from both Ethereum and Polygon chains
    for (const walletAddress of walletAddresses) {
        console.log(`Fetching NFTs for wallet: ${walletAddress}`);

        // Fetch and log raw Ethereum NFTs
        await fetchNFTs('ethereum', walletAddress);

        // Fetch and log raw Polygon NFTs
        await fetchNFTs('polygon', walletAddress);
    }
};

testFetchAndLogNFTs();
