import { supabase } from "./supabase.js";

const form = document.querySelector("#wishlist-form");
const fields = document.querySelector("#wish-fields");
const addWish = document.querySelector("#add-wish");
const errorBox = document.querySelector("#form-error");
const success = document.querySelector("#success");
const viewLink = document.querySelector("#view-link");
const copyLink = document.querySelector("#copy-link");
const copyStatus = document.querySelector("#copy-status");

let count = 0;
let savedUrl = "";

function addField() {
  if (count >= 3) return;
  count++;
  const card = document.createElement("div");
  card.className = "form-card wish-input-card";
  card.innerHTML = `
    <div class="wish-heading"><span>🎁 WISH #${count}</span>${count > 1 ? `<button type="button" class="remove-wish">Remove</button>` : ""}</div>
    <label>Wish name <span class="required">*</span></label>
    <input class="wish-name" maxlength="120" required placeholder="e.g. Nintendo Switch 2">
    <label>Description <span class="optional">(optional)</span></label>
    <textarea class="wish-description" maxlength="500" rows="3" placeholder="Add a size, colour, link, or anything else…"></textarea>
  `;
  card.querySelector(".remove-wish")?.addEventListener("click", () => {
    card.remove();
    [...fields.children].forEach((el, i) => {
      el.querySelector(".wish-heading span").textContent = `🎁 WISH #${i + 1}`;
    });
    count--;
    addWish.classList.remove("hidden");
  });
  fields.appendChild(card);
  if (count === 3) addWish.classList.add("hidden");
}

addWish.addEventListener("click", addField);
addField();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.textContent = "";

  const name = document.querySelector("#person-name").value.trim();
  const wishes = [...document.querySelectorAll(".wish-input-card")].map((card, i) => ({
    name: card.querySelector(".wish-name").value.trim(),
    description: card.querySelector(".wish-description").value.trim() || null,
    position: i + 1
  }));

  if (!name || wishes.length < 1 || wishes.some(w => !w.name)) {
    errorBox.textContent = "Please enter your name and at least one wish.";
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Saving…";

  const { data, error } = await supabase.rpc("create_wishlist", {
    p_name: name,
    p_wishes: wishes
  });

  if (error) {
    errorBox.textContent = error.message || "Could not save your wishlist.";
    button.disabled = false;
    button.textContent = "🎄 Save My Wishlist";
    return;
  }

  const id = data;
  savedUrl = `${location.origin}${location.pathname.replace(/add\.html$/, "wishlist.html")}?id=${id}`;
  viewLink.href = `wishlist.html?id=${id}`;
  form.classList.add("hidden");
  success.classList.remove("hidden");
});

copyLink.addEventListener("click", async () => {
  await navigator.clipboard.writeText(savedUrl);
  copyStatus.textContent = "Link copied!";
});
