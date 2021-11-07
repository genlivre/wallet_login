const ethereumButton = document.querySelector("#enterRoomButton");
const showAccount = document.querySelector(".eth-err");
if (!window.ethereum || !window.ethereum.isMetaMask) {
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
        const fetchedShow = document.querySelector("#fetchedShow");
        fetchedShow.style.display = "block";
        ethereumButton.style.display = "none";

        const dom = data.assets.map(
          (nft) =>
            `<li>
          <a href="${nft.permalink}" target="_blank"><img src="${nft.image_preview_url}" /></a>
        </li>`
        );

        const nfts = document.querySelector(".nfts");
        nfts.innerHTML = dom.join("");
      });
  }
}
