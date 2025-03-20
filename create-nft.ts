import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
// * save the address for collection
const collectionAddress = publicKey(
  "FigQz3rW1zPVuHAQRnQU1FNv21VVT3KrW8TgfbM4eyRy"
);
// const collectionAddress =new PublicKey(
//   "FigQz3rW1zPVuHAQRnQU1FNv21VVT3KrW8TgfbM4eyRy"
// ); both are the correct methods to get the public key

// create the NFT
console.log(`⚙ Creating NFT ...`);
const mint = generateSigner(umi);

// make the transaction to make the NFT
const transaction = await createNft(umi, {
  mint,
  name: "My NFT",
  uri: "https://raw.githubusercontent.com/Hassan1823/new-nft/refs/heads/main/nft-metadata.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: { key: collectionAddress, verified: false },
  //   tokenType: " mint",
});

await transaction.sendAndConfirm(umi);

// fetching the NFT we just made
const createdNFT = await fetchDigitalAsset(umi, mint.publicKey);
console.log(
  `🖼 Crated NFT address is : ${getExplorerLink(
    "address",
    createdNFT.mint.publicKey,
    "devnet"
  )}`
);
