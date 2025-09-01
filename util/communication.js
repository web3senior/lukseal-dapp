import Web3 from 'web3'
import ABI from '@/abi/LukSeals.json'

/**
 * Initialize Web3
 */
export function initContract() {
    const rpcUrl = process.env.NEXT_PUBLIC_LUKSO_PROVIDER

    if (!rpcUrl) throw new Error('WEB3_RPC_URL is not defined in environment variables.')

    // 1. Initialize Web3 with an HttpProvider for server-side connection
    const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))

    // Create a Contract instance
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
    return { web3, contract }
}

export async function getEmoji() {
    const { web3, contract } = initContract()

    try {
        const result = await contract.methods.getAllEmoji().call()
        return result
    } catch (error) {
        console.error("Error fetching contract data with Web3.js:", error)
        return { error }
    }
}

export async function getReaction(address = `0x0D5C8B7cC12eD8486E1E0147CC0c3395739F138d`) {
    const { web3, contract } = initContract()

    try {
        const result = await contract.methods.getAllUserReaction(address).call()
        return result
    } catch (error) {
        console.error("Error fetching contract data with Web3.js:", error)
        return { error }
    }
}

export async function getReactionCounter() {
    const { web3, contract } = initContract()

    try {
        const result = await contract.methods._reactionCounter().call()
        return result
    } catch (error) {
        console.error("Error fetching contract data with Web3.js:", error)
        return { error }
    }
}

export async function getAllEvents() {
    const { web3, contract } = initContract()

    try {
        // Get the latest block number (optional, but good for defining a range)
        const latestBlock = await web3.eth.getBlockNumber()
        console.log(`Latest block: ${latestBlock}`)

        // Fetch all events from the contract
        const allEvents = await contract.getPastEvents('allEvents', {
            fromBlock: 0, // Start from block 0 or a specific block number
            toBlock: 'latest' // Go up to the latest block or a specific block number
        });

        console.log(`All historical events: count(${allEvents.length})`)
        allEvents.forEach(event => {
            console.log('---')
            console.log(`Event Name: ${event.event}`)
            console.log(`Block Number: ${event.blockNumber}`)
            console.log(`Transaction Hash: ${event.transactionHash}`)
            console.log('Return Values:', event.returnValues)
        })
        return allEvents

    } catch (error) {
        console.error('Error fetching past events:', error)
    }
}
export async function getAllReacted() {
    const { web3, contract } = initContract()

    try {
        // Get the latest block number (optional, but good for defining a range)
        const latestBlock = await web3.eth.getBlockNumber()


        // Fetch specific events (e.g., 'Transfer' events)
        const reactEvents = await contract.getPastEvents('Reacted', {
            fromBlock: 0, // Example: fetch events from the last 1000 blocks
            toBlock: 'latest'
        })

        // reactEvents.forEach(event => {
        //     console.log('---');
        //     console.log(`Block Number: ${event.blockNumber}`);
        //     console.log(`From: ${event.returnValues.from}`);
        //     console.log(`To: ${event.returnValues.to}`);
        //     console.log(`Value: ${event.returnValues.value}`);
        // });
        return reactEvents
    } catch (error) {
        console.error('Error fetching past events:', error)
        return error
    }
}

export async function getLastGift() {
    const { web3, contract } = initContract()

    try {
        // Get the latest block number (optional, but good for defining a range)
        const latestBlock = await web3.eth.getBlockNumber()


        // Fetch specific events (e.g., 'Transfer' events)
        const reactEvents = await contract.getPastEvents('Reacted', {
            fromBlock: 0, // Example: fetch events from the last 1000 blocks
            toBlock: 'latest'
        })

        // reactEvents.forEach(event => {
        //     console.log('---');
        //     console.log(`Block Number: ${event.blockNumber}`);
        //     console.log(`From: ${event.returnValues.from}`);
        //     console.log(`To: ${event.returnValues.to}`);
        //     console.log(`Value: ${event.returnValues.value}`);
        // });
        return reactEvents
    } catch (error) {
        console.error('Error fetching past events:', error)
        return error
    }
}
