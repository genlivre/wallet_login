const ethereumButton = document.querySelector("#enterRoomButton");
const showAccount = document.querySelector(".eth-err");
let account = [];
let collections = [];

if (!window.ethereum || !window.ethereum.isMetaMask) {
  ethereumButton.disabled = true;
  showAccount.innerHTML = "MetaMaskをインストールしてください。";
} else {
  ethereumButton.addEventListener("click", () => {
    getAccount();
  });

  const select = document.querySelector("#select");
  let selectValue = "";

  select.addEventListener("change", (e) => {
    selectValue = e.currentTarget.value;
    if (selectValue === "すべて") {
      selectValue = "";
    }
    fetchUserNFTs(account);
  });

  async function getAccount() {
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    account = accounts[0];
    showAccount.innerHTML = account;
    fetchUserNFTs(account);
  }

  async function fetchUserNFTs(owner) {
    console.log(owner);
    const uri = `https://api.opensea.io/api/v1/assets?owner=${owner}&order_direction=desc&offset=0&collection=${selectValue}`;
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

        if (collections.length <= 1) {
          collections = data.assets.map((asset) => {
            return {
              slug: asset.collection.slug,
              collectionName: asset.collection.name,
            };
          });
        }

        const result = collections.filter(
          (element, index, self) => self.findIndex(
            e => e.collectionName === element.collectionName
          ) === index
        );

        const dom2 = result.map((nft) => {
          if (selectValue === nft.slug) {
            return `<option value="${nft.slug}" selected>
          ${nft.collectionName}
        </option>`;
          } else {
            return `<option value="${nft.slug}">
          ${nft.collectionName}
        </option>`;
          }
        });

        dom2.unshift("<option>すべて</option>");
        select.innerHTML = dom2.join("");
      });
  }
}
