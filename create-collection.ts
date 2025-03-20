import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
} from "@metaplex-foundation/umi";

//~ creating the connection
const connection = new Connection(clusterApiUrl("devnet"));
const user = await getKeypairFromFile();
// if we don't specify the file it'll use id.json that's in our home folder

// * giving ourself some SOl if we don't have
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);
console.log("Loaded user: ", user.publicKey.toBase58());

// *---------------------------------
// * creating the UMI instance
// helps us to talk to the Metaplex's tools
const umi = createUmi(connection.rpcEndpoint);
// tells the umi which program we want to use
umi.use(mplTokenMetadata());

// umi got it's own format for key pairs
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up umi instance for user");

// *---------------------------------
// * making the NFT's that represent the collections
const collectionMint = generateSigner(umi);
const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  symbol: "MC",
  uri: "https://raw.githubusercontent.com/Hassan1823/new-nft/refs/heads/main/metadata.json", //that uri should be a JSON that we've uploaded somewhere , and that can be accessed directly by that uri
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});
// collections are NFT itself pointing to other NFT's
await transaction.sendAndConfirm(umi);

// *---------------------------------
// * fetching the NFT's
const createdCollectionNFT = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
); //fetch the nft for that address
console.log(
  `Created Collection 📦! Address is: ${getExplorerLink(
    "address",
    createdCollectionNFT.mint.publicKey,
    "devnet"
  )}`
);
