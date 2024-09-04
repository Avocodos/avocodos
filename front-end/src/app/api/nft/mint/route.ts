import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    Aptos,
    AptosConfig,
    Network,
    Account,
    Ed25519PrivateKey,
    AccountAddress
} from "@aptos-labs/ts-sdk";
import { formatDatePretty } from "@/lib/utils";
import { validateRequest } from "@/auth";
import { AssetType } from "@prisma/client";

const APTOS_NETWORK: Network = Network.TESTNET;
const config = new AptosConfig({ network: APTOS_NETWORK });
const aptos = new Aptos(config);

export async function POST(req: NextRequest) {
    const { user } = await validateRequest();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();

    const userData = await prisma?.user.findUnique({
        where: { id: user.id },


    });

    if (!userData || !userData.walletAddress) {
        return NextResponse.json({ error: "User wallet address not found" }, { status: 400 });
    }

    const course = await prisma?.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Avocodos account setup
    const privateKeyBytes = Uint8Array.from(
        Buffer.from(process.env.AVOCODOS_PRIVATE_KEY!.slice(2), "hex")
    );
    const privateKey = new Ed25519PrivateKey(privateKeyBytes);
    const avocodosAccount = Account.fromPrivateKey({ privateKey });

    try {
        const { mintedNFT, createdAsset } = await mintNFT(userData.walletAddress, course.title, user.displayName, avocodosAccount, courseId, user.id);
        return NextResponse.json({ success: true, nft: mintedNFT, asset: createdAsset });
    } catch (error) {
        console.error("Error minting NFT:", error);
        return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 });
    }
}

async function mintNFT(recipientAddress: string, courseTitle: string, displayName: string, avocodosAccount: Account, courseId: string, userId: string) {
    const collectionName = "Avocodos Courses";
    const collectionDescription = "Recieve NFTs for completing Avocodos courses!";
    const collectionURI = `https://utfs.io/f/bcd8a212-e94d-44c3-8a43-8d66b492806c-1sfc8.jpg`;

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
    const tokenName = `${courseTitle} Completion`;
    const tokenDescription = `Completion certificate for ${courseTitle}, issued to ${displayName} on ${formatDatePretty(new Date())}.`;
    const tokenURI = `https://utfs.io/f/0c857e56-5231-4d44-a4e6-0f0ca95546b4-1e.jpg`;

    // Add this line to specify the image URL
    // const imageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/nft-images/2.jpg`;
    const imageUrl = 'https://utfs.io/f/0c857e56-5231-4d44-a4e6-0f0ca95546b4-1e.jpg'

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
    console.log("avocodoNFTs", avocodoNFTs);
    const mintedNFT = avocodoNFTs[avocodoNFTs.length - 1];

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
        type: AssetType.NFT,
        url: tokenURI,
        name: tokenName,
        txnHash: transferTxn?.hash ?? "",
        tokenId: mintedNFT.token_data_id ?? "",
        chain: APTOS_NETWORK,
        collection: collectionName,
        metadata: JSON.stringify(mintedNFT),
        metadataUrl: tokenURI,
        description: tokenDescription,
        aptosExplorerUrl: `https://explorer.aptoslabs.com/txn/${transferTxn?.hash}?network=testnet`,
        courseId: courseId
    };

    const createdAsset = await prisma?.asset.create({
        data: assetData
    });

    return { mintedNFT, createdAsset };
}