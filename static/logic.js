Moralis.initialize("Nn3L5VnAaBK9O6qVy9RMGWmdwGgVE9CMMoKOFfnZ"); // Application id from moralis.io
Moralis.serverURL = "https://o8rgonfjhhoa.usemoralis.com:2053/server"; //Server url from moralis.io

const nft_contract_address = "0xb33269c94a859D06E3d6abB0c5488D16d1c0f628" //NFT Minting Contract Use This One "Batteries Included", code of this contract is in the github repository under contract_base for your reference.
/*
Available deployed contracts
Ethereum Rinkeby 0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431
Polygon Mumbai 0x351bbee7C6E9268A1BF741B098448477E08A0a53
BSC Testnet 0x88624DD1c725C6A95E223170fa99ddB22E1C6DDD
*/
initializeWeb3();
prtTotalSupply();
const web3 = new Web3(window.ethereum);


//Step 1 Initialize Web3
async function initializeWeb3(){ 
    Moralis.authenticate();
}

//Step 2 Generate Character
async function getNftPicture(){
    const configArray = getRandomValues();
    const characterIndex = (configArray[0] % 7) +1;
    const character = await mapNft(characterIndex);
    const metadata = {
        "image":character["URI"]
    }
    const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
//    displayNFT(metadataURI);
    const txt = await mintNft(metadataURI).then(console.log)
}

function getRandomValues(){
    let array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    console.log(array);
    return array;

}

async function mapNft(characterIndex){
    const images = await fetch("static/ipfsCollection.json")
    const ipfsUris = await images.json()
    return {"URI":ipfsUris[characterIndex]}
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


async function mintNft(_uri){
    await Moralis.transfer({type:"native", receiver: "0xde152f5fAF03ec67F7e0BC7970A2f6529DB64301",
    amount: Moralis.Units.ETH("0.01")});

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
    data: encodedFunction
  };
  const txt = await ethereum.request({
    method: 'eth_sendTransaction',
    params: [transactionParameters]
  });

  return txt
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
        address: "0xb33269c94a859D06E3d6abB0c5488D16d1c0f628",
        function_name: "getTotalSupply",
        abi: ABI
     //   params: { owner: "0x1...2", spender: "0x1...2" },
      };
      const allowance = await Moralis.Web3API.native.runContractFunction(options);
      console.log("current TotalSupply is: " + allowance);

      document.getElementById("totalSupply").innerHTML = `<div>${allowance} / 333 Nft minted</div>`;
}
