import { supabase } from "./supabase.js";

const loginPanel = document.querySelector("#login-panel");
const adminPanel = document.querySelector("#admin-panel");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const adminList = document.querySelector("#admin-list");
const adminStatus = document.querySelector("#admin-status");

const esc = (v="") => v.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));

async function refresh() {
  adminStatus.textContent = "Loading…";
  const { data, error } = await supabase
    .from("wishlists")
    .select("id,name,created_at,wishes(id,name,description,position)")
    .order("created_at", { ascending: false });

  if (error) {
    adminStatus.textContent = error.message;
    return;
  }

  adminStatus.classList.add("hidden");
  adminList.innerHTML = (data || []).map(w => `
    <article class="admin-card" data-id="${w.id}">
      <div class="admin-card-head">
        <input class="admin-name" value="${esc(w.name)}" maxlength="80">
        <button class="danger delete-wishlist">Delete Wishlist</button>
      </div>
      <div class="admin-wishes">
        ${(w.wishes || []).sort((a,b)=>a.position-b.position).map(x => `
          <div class="admin-wish" data-wish-id="${x.id}">
            <input class="edit-wish-name" value="${esc(x.name)}" maxlength="120">
            <textarea class="edit-wish-desc" maxlength="500" rows="2">${esc(x.description || "")}</textarea>
          </div>
        `).join("")}
      </div>
      <button class="button ghost save-wishlist">Save Changes</button>
      <span class="save-result"></span>
    </article>
  `).join("") || `<div class="empty-card">No wishlists yet.</div>`;
}

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";
  const { error } = await supabase.auth.signInWithPassword({
    email: document.querySelector("#email").value,
    password: document.querySelector("#password").value
  });
  if (error) loginError.textContent = error.message;
  else {
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    refresh();
  }
});

document.querySelector("#logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  adminPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");
});

adminList.addEventListener("click", async e => {
  const card = e.target.closest(".admin-card");
  if (!card) return;
  const id = card.dataset.id;
  const result = card.querySelector(".save-result");

  if (e.target.classList.contains("delete-wishlist")) {
    if (!confirm("Delete this entire wishlist? This cannot be undone.")) return;
    const { error } = await supabase.from("wishlists").delete().eq("id", id);
    if (error) result.textContent = error.message;
    else await refresh();
    return;
  }

  if (e.target.classList.contains("save-wishlist")) {
    const { error: listError } = await supabase
      .from("wishlists")
      .update({ name: card.querySelector(".admin-name").value.trim() })
      .eq("id", id);

    if (listError) { result.textContent = listError.message; return; }

    const wishCards = [...card.querySelectorAll(".admin-wish")];
    for (const wishCard of wishCards) {
      const { error } = await supabase.from("wishes").update({
        name: wishCard.querySelector(".edit-wish-name").value.trim(),
        description: wishCard.querySelector(".edit-wish-desc").value.trim() || null
      }).eq("id", wishCard.dataset.wishId);
      if (error) { result.textContent = error.message; return; }
    }
    result.textContent = "Saved ✓";
    setTimeout(() => result.textContent = "", 2000);
  }
});

supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    loginPanel.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    refresh();
  }
});
