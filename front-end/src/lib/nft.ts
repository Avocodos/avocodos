import prisma from "@/lib/prisma";
import {
    Aptos,
    AptosConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    AccountAddress
} from "@aptos-labs/ts-sdk";
import { AssetType } from "@prisma/client";
import { AVOCODOS_WELCOME_REWARD_ID } from "./constants";

const APTOS_NETWORK: Network = Network.TESTNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export async function mintNFT({
    recipientAddress,
    courseTitle,
    displayName,
    imageUrl,
    userId,
}: {
    recipientAddress: string;
    courseTitle: string;
    displayName: string;
    imageUrl: string;
    userId: string;
}) {
    // Avocodos account setup
    const privateKeyBytes = Uint8Array.from(
        Buffer.from(process.env.AVOCODOS_PRIVATE_KEY!.slice(2), "hex")
    );
    const privateKey = new Ed25519PrivateKey(privateKeyBytes);
    const avocodosAccount = Account.fromPrivateKey({ privateKey });

    const collectionName = "Welcome To Avocodos";
    const collectionDescription = `Welcome NFT for ${displayName} as a reward for joining Avocodos!`;
    const collectionURI = `https://utfs.io/f/bcd8a212-e94d-44c3-8a43-8d66b492806c-1sfc8.jpg`;

    if (!prisma) {
        throw new Error("Prisma client not initialized");
    }

    // Function to get the latest account information
    const getLatestAccountInfo = async () => {
        const accountInfo = await aptos.getAccountInfo({ accountAddress: avocodosAccount.accountAddress });
        return accountInfo.sequence_number;
    };

    // Function to submit transaction with retry logic
    const submitTransactionWithRetry = async (transaction: any, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const latestSequenceNumber = await getLatestAccountInfo();
                transaction.sequence_number = latestSequenceNumber;

                const txn = await aptos.signAndSubmitTransaction({
                    signer: avocodosAccount,
                    transaction: transaction
                });
                await aptos.waitForTransaction({ transactionHash: txn.hash });
                return txn;
            } catch (error: any) {
                if (i === maxRetries - 1 || !error.message.includes('SEQUENCE_NUMBER_TOO_OLD')) {
                    throw error;
                }
                // Wait for a short time before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    };

    // Create collection if it doesn't exist
    try {
        const createCollectionTransaction = await aptos.createCollectionTransaction({
            creator: avocodosAccount,
            description: collectionDescription,
            name: collectionName,
            uri: collectionURI
        });
        await submitTransactionWithRetry(createCollectionTransaction);
    } catch (error) {
        console.error("Error creating collection:", error);
    }

    // Mint NFT
    const tokenName = courseTitle;
    const tokenDescription = `Welcome NFT for ${displayName}. Enjoy your journey on Avocodos!`;
    const tokenURI = imageUrl;

    const mintTokenTransaction = await aptos.mintDigitalAssetTransaction({
        creator: avocodosAccount,
        collection: collectionName,
        description: tokenDescription,
        name: tokenName,
        uri: tokenURI,
        propertyKeys: ["image"],
        propertyTypes: ["STRING"],
        propertyValues: [imageUrl]
    });

    await submitTransactionWithRetry(mintTokenTransaction);

    // Get the minted NFT
    const avocodoNFTs = await aptos.getOwnedDigitalAssets({
        ownerAddress: avocodosAccount.accountAddress
    });
    const mintedNFT = avocodoNFTs.filter((nft) => {
        return nft.current_token_data?.description === tokenDescription
    })[0]

    // Transfer NFT to recipient
    const transferTransaction = await aptos.transferDigitalAssetTransaction({
        sender: avocodosAccount,
        digitalAssetAddress: mintedNFT.token_data_id ?? "",
        recipient: recipientAddress as unknown as AccountAddress
    });

    const transferTxn = await submitTransactionWithRetry(transferTransaction);

    // Store NFT information in the database
    const assetData = {
        userId: userId,
        type: "NFT" as AssetType,
        url: tokenURI,
        name: tokenName,
        txnHash: transferTxn?.hash ?? "",
        tokenId: mintedNFT.token_data_id ?? "",
        chain: APTOS_NETWORK,
        collection: collectionName,
        metadata: JSON.stringify(mintedNFT),
        metadataUrl: tokenURI,
        description: tokenDescription,
        aptosExplorerUrl: `https://explorer.aptoslabs.com/txn/${transferTxn?.hash}?network=testnet`
    };

    const createdAsset = await prisma.asset.create({
        data: assetData
    });

    return { mintedNFT, createdAsset };
}