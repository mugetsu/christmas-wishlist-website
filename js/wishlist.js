import { supabase } from "./supabase.js";

const params = new URLSearchParams(location.search);
const id = params.get("id");
const content = document.querySelector("#wishlist-content");

const esc = (v="") => v.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));

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
            <div><h3>${esc(w.name)}</h3>${w.description ? `<p>${esc(w.description)}</p>` : ""}</div>
          </div>`).join("")}
      </div>
      <a class="button primary" href="index.html">See Everyone’s Wishes</a>
    </div>`;
}
load();
