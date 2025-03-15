document.addEventListener("DOMContentLoaded", async function () {
    if (typeof window.ethereum === "undefined") {
        alert("MetaMask is required to place a bid.");
        return;
    }

    const web3 = new Web3(window.ethereum);
    let userAccount;

    try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        userAccount = accounts[0];
    } catch (error) {
        console.error("Wallet Connection Failed:", error);
        alert("Please connect MetaMask.");
        return;
    }

    const contractAddress = "0xC9155700d5D403644eFf9166A9DaD92B06539262"; // Replace with deployed contract address
    const contractABI = [ // Replace with actual ABI from Remix or Hardhat
        {
            "constant": false,
            "inputs": [{ "name": "_itemId", "type": "uint256" }],
            "name": "placeBid",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ];

    const auctionContract = new web3.eth.Contract(contractABI, contractAddress);

    document.getElementById("place-bid").addEventListener("click", async function () {
        const bidAmount = parseFloat(document.getElementById("bid-amount").value);
        const bidInWei = web3.utils.toWei(bidAmount.toString(), "ether");

        try {
            await auctionContract.methods.placeBid(1).send({
                from: userAccount,
                value: bidInWei
            });

            alert("Bid placed on blockchain!");
        } catch (error) {
            console.error("Transaction Failed:", error);
            alert("Bid transaction failed.");
        }
    });
});
