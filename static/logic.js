Moralis.initialize("Nn3L5VnAaBK9O6qVy9RMGWmdwGgVE9CMMoKOFfnZ"); // Application id from moralis.io
Moralis.serverURL = "https://o8rgonfjhhoa.usemoralis.com:2053/server"; //Server url from moralis.io

const nft_contract_address = "0x3138D3158750E8Db32448B675A08cB250E328b58" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
/*
Available deployed contracts
Ethereum Rinkeby 0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431
Polygon Mumbai 0x351bbee7C6E9268A1BF741B098448477E08A0a53
BSC Testnet 0x88624DD1c725C6A95E223170fa99ddB22E1C6DDD
*/
//initializeWeb3();
prtTotalSupply();
const web3 = new Web3(window.ethereum);


//Step 1 Initialize Web3
async function connectWallet(){ 
    Moralis.authenticate();
} 


//Step 2 Generate Character
async function getNftPicture(){
    const configId = await prtTotalSupply();
  //  const configArray = getRandomValues(); // Itt lesz egy array amibe van egy random szám, egy nagyobb random szám
  //  const characterIndex = (configArray[0] % 7) + 1; // itt megkapsz egy random számot, maximum akkorát ami a modulo után van, tehát most itt 7-est
    const charIndex = configId;

    if(charIndex == 333){
      alert("All NFTs minted in the contract!")
    }
    else {
      const character = await mapNft(charIndex);
      const metadata = {
          "name":character["Names"],
          "image":character["URI"],
          "seller_fee_basis_points": 750,
          "fee_recipient": "0xde152f5fAF03ec67F7e0BC7970A2f6529DB64301"
      }
      const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
      await metadataFile.saveIPFS();
      const metadataURI = metadataFile.ipfs();
  //    displayNFT(metadataURI);
      const txt = await mintNft(metadataURI).then(console.log)
    }

}

function getRandomValues(){
    let array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    console.log(array);
    return array;

}

async function mapNft(charIndex){
    const images = await fetch("static/ipfsCollection.json")
    const ipfsUris = await images.json()
    const iNames = {
      1:"Gandalf the Grey",
      2:"Gandalf the Grey",
      3:"Gandalf the Grey",
      4:"Cattie",
      5:"Cattie"
    }
    return {"Names":iNames[charIndex], "URI":ipfsUris[charIndex]}
} 

/*async function displayNFT(metadataUri){
    const metadata = await fetch(metadataUri);
    nftData = await metadata.json();
    nftImageTag = `<div class="container">
                        <div class="col-sm-">                
                            <img src=${nftData["image"]} class="img-fluid" >
                        </div>
                    </div>`            
    document.getElementById("displayNFT").innerHTML = ""
    document.getElementById("displayNFT").innerHTML += nftImageTag;

}*/

/*async function mapImageName(charIndex){
  const images = await fetch("static.ipfsCollection.json")
  const ipfsUris = await images.json()
  const names = {
    1:"Gandalf the Grey",
    2:"Gandalf the Grey",
    3:"Gandalf the Grey",
  }

  return{"Names":name}
}
*/

async function mintNft(_uri){

 /*  await Moralis.transfer({type:"native", receiver: "0xde152f5fAF03ec67F7e0BC7970A2f6529DB64301",
   amount: Moralis.Units.ETH("0.01")}); */

var ABI = {
  "inputs": [
    {
      "internalType": "string",
      "name": "tokenURI",
      "type": "string"
    }
  ],
  "name": "mintNft",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function",
  "payable": true
};
const options = {
   contractAddress: nft_contract_address,
   functionName: "mintNft",
   abi: ABI,
   params: {tokenURI: _uri},
   msgValue: Moralis.Units.ETH(0.01)
}
await Moralis.executeFunction(options);

/*
  const encodedFunction = web3.eth.abi.encodeFunctionCall({
    name: "mintNft",
    type: "function",
    inputs: [{
      type: 'string',
      name: 'tokenURI'
      }]
  }, [_uri]);

  const transactionParameters = {
    to: nft_contract_address,
    from: ethereum.selectedAddress,
    data: encodedFunction,

  };
  const txt = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters],

  });

  return txt */ 
} 

async function prtTotalSupply(){
    await Moralis.start({
        serverUrl: "https://o8rgonfjhhoa.usemoralis.com:2053/server",
        appId: "Nn3L5VnAaBK9O6qVy9RMGWmdwGgVE9CMMoKOFfnZ"
    });
    const ABI = [
        {
            "inputs": [],
            "name": "getTotalSupply",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          }
    ];
    
    const options = {
        chain: "rinkeby",
        address: nft_contract_address, // Ezt át kell írni minden deployment után
        function_name: "getTotalSupply",
        abi: ABI
     //   params: { owner: "0x1...2", spender: "0x1...2" },
      };
      const allowance = await Moralis.Web3API.native.runContractFunction(options);
      document.getElementById("totalSupply").innerHTML = `<div>${ allowance -1} / 333 Nft minted</div>`; // Ezt is át kell írni hogyha változtatunk a totalSupplyon
      console.log("Next Id that is going to be minted is: " + allowance);
      return allowance;
}

