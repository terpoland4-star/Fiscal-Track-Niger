/* =========================================
   🚀 NIGERTAX PRO - CORE APP
========================================= */

const App = {

  /* =========================
     📦 STATE GLOBAL
  ========================= */
  state: {
    user: {
      nif: "NIF-0001",
      name: "Contribuable"
    },
    fiscal: {
      ca: 0,
      charges: 0,
      regime: "",
      impot: 0,
      type: ""
    },
    historique: JSON.parse(localStorage.getItem("nigerTaxHistorique")) || []
  },

  /* =========================
     🚀 INIT
  ========================= */
  init() {
    this.bindEvents();
    this.renderHistorique();
    this.updateDashboard();
    this.showSection("dashboard");
  },

  /* =========================
     🔗 EVENTS
  ========================= */
  bindEvents() {
    window.showSection = this.showSection.bind(this);
    window.calculer = this.calculer.bind(this);
    window.simuler = this.simuler.bind(this);
    window.payer = this.payer.bind(this);
  },

  /* =========================
     🧭 NAVIGATION
  ========================= */
  showSection(id) {
    document.querySelectorAll(".section").forEach(sec => {
      sec.classList.add("hidden");
    });

    document.getElementById(id).classList.remove("hidden");
  },

  /* =========================
     🧠 REGIME FISCAL
  ========================= */
  detectRegime(ca) {
    if (ca < 50000000) return "Synthétique";
    if (ca < 100000000) return "Simplifié";
    return "Régime Réel";
  },

  /* =========================
     💰 CALCUL FISCAL
  ========================= */
  calculer() {
    const ca = parseFloat(document.getElementById("ca").value) || 0;
    const charges = parseFloat(document.getElementById("charges").value) || 0;
    const type = document.getElementById("typeTaxe").value;

    const regime = this.detectRegime(ca);
    const base = Math.max(ca - charges, 0);

    let impot = 0;

    const rules = {
      tva: () => ca * 0.19,
      isb: () => base * 0.3,
      synthetique: () => ca * 0.05
    };

    impot = rules[type] ? rules[type]() : 0;

    this.state.fiscal = { ca, charges, regime, impot, type };

    document.getElementById("resultat").innerText = this.formatMoney(impot);

    this.notify(`Calcul ${type.toUpperCase()} effectué ✅`);
    this.updateDashboard();
  },

  /* =========================
     🔮 SIMULATION
  ========================= */
  simuler() {
    const ca = parseFloat(document.getElementById("simCA").value) || 0;

    const regime = this.detectRegime(ca);
    const impot = ca * 0.2;

    document.getElementById("simResult").innerText =
      `${this.formatMoney(impot)} (${regime})`;

    this.notify("Simulation fiscale générée 📊");
  },

  /* =========================
     💳 PAIEMENT
  ========================= */
  payer(type) {
    const { impot } = this.state.fiscal;

    if (!impot || impot <= 0) {
      return this.notify("Aucun impôt à payer ❌", "error");
    }

    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      type: this.state.fiscal.type.toUpperCase(),
      montant: impot,
      statut: "Payé",
      canal: type
    };

    this.state.historique.push(entry);
    this.save();

    document.getElementById("paiementStatus").innerText =
      `Paiement ${type} réussi ✅`;

    this.renderHistorique();
    this.updateDashboard();

    this.notify("Paiement enregistré 💰");
  },

  /* =========================
     📜 HISTORIQUE
  ========================= */
  renderHistorique() {
    const table = document.getElementById("historique");
    if (!table) return;

    table.innerHTML = "";

    this.state.historique.forEach(item => {
      table.innerHTML += `
        <tr>
          <td class="p-2">${item.date}</td>
          <td class="p-2">${item.type}</td>
          <td class="p-2">${this.formatMoney(item.montant)}</td>
          <td class="p-2 text-green-500">${item.statut}</td>
        </tr>
      `;
    });
  },

  /* =========================
     📊 DASHBOARD
  ========================= */
  updateDashboard() {
    const { impot } = this.state.fiscal;

    const total = this.state.historique.reduce(
      (sum, item) => sum + item.montant, 0
    );

    const score = Math.min(100, this.state.historique.length * 10 + 50);

    document.getElementById("impot").innerText =
      this.formatMoney(impot);

    document.getElementById("totalPaiement").innerText =
      this.formatMoney(total);

    document.getElementById("score").innerText =
      score + "%";
  },

  /* =========================
     💾 STORAGE
  ========================= */
  save() {
    localStorage.setItem(
      "nigerTaxHistorique",
      JSON.stringify(this.state.historique)
    );
  },

  /* =========================
     🔔 NOTIFICATIONS
  ========================= */
  notify(message, type = "success") {
    const toast = document.createElement("div");

    toast.innerText = message;

    toast.className = `
      fixed bottom-5 right-5 px-4 py-2 rounded shadow text-white
      ${type === "error" ? "bg-red-500" : "bg-black"}
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  },

  /* =========================
     💡 UTIL
  ========================= */
  formatMoney(value) {
    return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
  }

};

/* =========================================
   🚀 LANCEMENT APP
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
