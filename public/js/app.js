const productList = document.querySelector("#product-list");
const productStatus = document.querySelector("#product-status");
const productCount = document.querySelector("#product-count");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const chatStatus = document.querySelector("#chat-status");
const sendButton = chatForm.querySelector("button");

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function showProductMessage(message) {
  productStatus.textContent = message;
  productStatus.hidden = false;
}

function renderProduct(product) {
  const card = document.createElement("article");
  card.className = "product-item";

  const productInfo = document.createElement("div");
  const name = document.createElement("h2");
  name.className = "product-name";
  name.textContent = product.name;
  productInfo.append(name);

  if (product.description) {
    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description;
    productInfo.append(description);
  }

  const details = document.createElement("div");
  details.className = "product-details";

  const price = document.createElement("strong");
  price.className = "product-price";
  price.textContent = rupiah.format(product.price);

  const stock = document.createElement("span");
  stock.className = "product-stock";
  stock.textContent =
    Number(product.stock) > 0 ? `Stok ${product.stock}` : "Stok habis";

  details.append(price, stock);
  card.append(productInfo, details);
  return card;
}

async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Produk belum bisa dimuat.");
    }

    const products = Array.isArray(result.data) ? result.data : [];
    productCount.textContent = `${products.length} produk`;

    if (products.length === 0) {
      showProductMessage("Belum ada produk untuk ditampilkan.");
      return;
    }

    productList.replaceChildren(...products.map(renderProduct));
  } catch (error) {
    productCount.textContent = "";
    showProductMessage(
      error.message || "Gagal memuat produk. Coba muat ulang halaman.",
    );
  }
}

function addMessage(message, sender) {
  const bubble = document.createElement("p");
  bubble.className = `chat-bubble chat-bubble--${sender}`;
  bubble.textContent = message;
  chatMessages.append(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();

  if (!message) return;

  addMessage(message, "user");
  chatInput.value = "";
  chatStatus.textContent = "Menunggu balasan...";
  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Pesan belum bisa dikirim.");
    }

    addMessage(result.data.reply, "agent");
    chatStatus.textContent = "";
  } catch (error) {
    chatStatus.textContent =
      error.message || "Gagal mengirim pesan. Coba lagi.";
  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
});

loadProducts();
