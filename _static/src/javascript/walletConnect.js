const ethereumButton = document.querySelector(".enableEthereumButton");
const showAccount = document.querySelector(".showAccount");
if (!window.ethereum || !window.ethereum.isMetaMask) {
  // alert("MetaMaskをインストールしてください。");
  ethereumButton.disabled = true;
  showAccount.innerHTML = "MetaMaskをインストールしてください。";
} else {
  ethereumButton.addEventListener("click", () => {
    getAccount();
  });

  async function getAccount() {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = accounts[0];
    showAccount.innerHTML = account;
    fetchUserNFTs(account);
  }

  async function fetchUserNFTs(owner) {
    console.log(owner);
    const uri = `https://api.opensea.io/api/v1/assets?owner=${owner}&order_direction=desc&offset=0`;
    await fetch(uri)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        const dom = data.assets.map(
          (nft) =>
            `<li>
          <img src="${nft.image_preview_url}" />
        </li>`
        );

        const nfts = document.querySelector(".nfts");
        nfts.innerHTML = dom.join("");
      });
  }
}
