import { supabase } from "./supabase.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const content = document.querySelector("#wishlist-content");

const esc = (v="") => v.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));

function formatDescription(value = "") {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return value.split(urlPattern).map(part => {
    if (!/^https?:\/\//i.test(part)) return esc(part);

    const cleanUrl = part.replace(/[),.!?;:]+$/, "");
    const trailing = part.slice(cleanUrl.length);

    try {
      const parsed = new URL(cleanUrl);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return esc(part);
      }

      return `<a href="${esc(parsed.href)}" target="_blank" rel="noopener noreferrer">${esc(cleanUrl)}</a>${esc(trailing)}`;
    } catch {
      return esc(part);
    }
  }).join("");
}

async function load() {
  if (!id) { content.innerHTML = "<p>Wishlist not found.</p>"; return; }
  const { data, error } = await supabase
    .from("wishlists")
    .select("id,name,wishes(id,name,description,position)")
    .eq("id", id)
    .single();

  if (error || !data) {
    content.innerHTML = "<p>Wishlist not found.</p>";
    return;
  }

  const wishes = [...(data.wishes || [])].sort((a,b)=>a.position-b.position);
  content.innerHTML = `
    <div class="personal-card">
      <div class="personal-icon">🎄</div>
      <p class="eyebrow">Christmas Wishlist</p>
      <h1>${esc(data.name)}’s List</h1>
      <div class="personal-wishes">
        ${wishes.map((w,i)=>`
          <div class="personal-wish">
            <span>${i+1}</span>
            <div class="personal-wish-content">
            <h3>${esc(w.name)}</h3>
            ${w.description ? `
              <div class="wish-description">
                <p>${formatDescription(w.description)}</p>
                <button class="copy-description" type="button"
                  data-copy-description="${esc(w.description)}">
                  Copy description
                </button>
              </div>
            ` : ""}
          </div>
          </div>`).join("")}
      </div>
      <a class="button primary" href="index.html">See Everyone’s Wishes</a>
    </div>`;
}

content.addEventListener("click", async event => {
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
