import { supabase } from "./supabase.js";

const grid = document.querySelector("#wishlist-grid");
const status = document.querySelector("#status");
const search = document.querySelector("#search");
const wishlistCount = document.querySelector("#wishlist-count");
const wishCount = document.querySelector("#wish-count");

let wishlists = [];

const escapeHtml = (value = "") =>
  value.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));

function formatDescription(value = "") {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return value.split(urlPattern).map(part => {
    if (!/^https?:\/\//i.test(part)) return escapeHtml(part);

    const cleanUrl = part.replace(/[),.!?;:]+$/, "");
    const trailing = part.slice(cleanUrl.length);

    try {
      const parsed = new URL(cleanUrl);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return escapeHtml(part);
      }

      return `<a href="${escapeHtml(parsed.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(cleanUrl)}</a>${escapeHtml(trailing)}`;
    } catch {
      return escapeHtml(part);
    }
  }).join("");
}

function render() {
  const q = search.value.trim().toLowerCase();
  const filtered = wishlists.filter(w =>
    w.name.toLowerCase().includes(q) ||
    w.wishes.some(x => `${x.name} ${x.description || ""}`.toLowerCase().includes(q))
  );

  grid.innerHTML = filtered.map(w => `
    <article class="wishlist-card">
      <div class="card-ribbon">🎁</div>
      <h3>${escapeHtml(w.name)}</h3>
      <div class="wishes">
        ${w.wishes.map((x, i) => `
          <div class="wish">
            <span class="wish-number">${i + 1}</span>
            <div>
              <strong>${escapeHtml(x.name)}</strong>
              ${x.description ? `<div class="wish-description"><p>${formatDescription(x.description)}</p><button class="copy-description" type="button" data-copy-description="${escapeHtml(x.description)}" aria-label="Copy description">Copy</button></div>` : ""}
            </div>
          </div>`).join("")}
      </div>
    </article>
  `).join("");

  status.textContent = filtered.length ? "" : (q ? "No wishes match your search." : "No wishlists yet. Be the first!");
  status.classList.toggle("hidden", filtered.length > 0);
}

async function load() {
  const { data, error } = await supabase
    .from("wishlists")
    .select("id,name,created_at,wishes(id,name,description,position)")
    .order("created_at", { ascending: false });

  if (error) {
    status.textContent = "Could not load the wishlist. Check your Supabase setup.";
    console.error(error);
    return;
  }

  wishlists = (data || []).map(w => ({
    ...w,
    wishes: [...(w.wishes || [])].sort((a,b) => a.position - b.position)
  }));

  wishlistCount.textContent = wishlists.length;
  wishCount.textContent = wishlists.reduce((n, w) => n + w.wishes.length, 0);
  render();
}

search.addEventListener("input", render);

grid.addEventListener("click", async event => {
  const button = event.target.closest(".copy-description");
  if (!button) return;

  const originalLabel = button.textContent;

  try {
    await navigator.clipboard.writeText(button.dataset.copyDescription || "");
    button.textContent = "Copied!";
  } catch {
    button.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    button.textContent = originalLabel;
  }, 1600);
});

load();
