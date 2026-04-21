/* =========================
   CONFIG
========================= */

const CONFIG = {
  SHEET_API_URL: "https://sheetdb.io/api/v1/6w8tib81woerj",

  PET_RENT: 40,
  PET_DEPOSIT: 300
};

/* =========================
   STATE
========================= */

let properties = {};
let sheetData = [];

/* =========================
   LOAD DATA
========================= */

async function loadProperties() {
  try {
    const res = await fetch(CONFIG.SHEET_API_URL);

    if (!res.ok) throw new Error("Failed to fetch sheet data");

    sheetData = await res.json();

    const select = document.getElementById("property");
    select.innerHTML = "";

    properties = {};

    sheetData.forEach(row => {
      const name = row["Property Name"];

      const charges = row[
        "Charge type and amount to be added (If charge already appears in the recurring charges after moving tenant in no action needed)"
      ] || "";

      if (!name) return;

      properties[name] = {
        rawCharges: charges
      };

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;

      select.appendChild(option);
    });

  } catch (err) {
    console.error("Sheet load error:", err);
    alert("Failed to load property data. Check API.");
  }
}

/* =========================
   CHARGE PARSER (ROBUST)
========================= */

function parseCharges(text) {
  if (!text || typeof text !== "string") return [];

  return text
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.includes(":"))
    .map(line => {
      const splitIndex = line.indexOf(":");

      return {
        type: line.slice(0, splitIndex).trim(),
        value: line.slice(splitIndex + 1).trim()
      };
    });
}

/* =========================
   UTILITIES CALCULATOR
========================= */

function calculateUtilities(rawText) {
  const charges = parseCharges(rawText);

  let total = 0;

  charges.forEach(c => {
    const num = parseFloat(c.value.replace(/[^0-9.]/g, ""));

    if (!isNaN(num)) total += num;
  });

  return total;
}

/* =========================
   PRORATION ENGINE
========================= */

function calculateProratedRent(rent, moveInDate) {
  if (!rent || !moveInDate) return 0;

  const date = new Date(moveInDate);

  if (isNaN(date)) return 0;

  const year = date.getFullYear();
  const month = date.getMonth();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const moveInDay = date.getDate();

  const remainingDays = totalDays - moveInDay + 1;

  return (remainingDays / totalDays) * rent;
}

/* =========================
   MAIN CALCULATION ENGINE
========================= */

function calculate() {
  try {
    const propertyName = document.getElementById("property").value;
    const rent = parseFloat(document.getElementById("rent").value);
    const moveIn = document.getElementById("moveIn").value;
    const pets = parseInt(document.getElementById("pets").value) || 0;

    if (!propertyName || !rent || !moveIn) {
      alert("Please fill all required fields.");
      return;
    }

    const property = properties[propertyName];

    if (!property) {
      alert("Property not found in dataset.");
      return;
    }

    const proratedRent = calculateProratedRent(rent, moveIn);

    const utilitiesTotal = calculateUtilities(property.rawCharges);

    const petRent = pets * CONFIG.PET_RENT;
    const petDeposit = pets * CONFIG.PET_DEPOSIT;

    const total =
      proratedRent +
      utilitiesTotal +
      petRent +
      petDeposit;

    renderResult({
      propertyName,
      proratedRent,
      utilitiesTotal,
      petRent,
      petDeposit,
      total
    });

  } catch (err) {
    console.error("Calculation error:", err);
    alert("Something went wrong during calculation.");
  }
}

/* =========================
   UI RENDERER
========================= */

function renderResult(data) {
  document.getElementById("result").innerHTML = `
    <h3>Lease Breakdown</h3>

    <p><b>Property:</b> ${data.propertyName}</p>

    <p><b>Prorated Rent:</b> $${data.proratedRent.toFixed(2)}</p>

    <p><b>Utilities:</b> $${data.utilitiesTotal.toFixed(2)}</p>

    <p><b>Pet Rent:</b> $${data.petRent.toFixed(2)}</p>

    <p><b>Pet Deposit:</b> $${data.petDeposit.toFixed(2)}</p>

    <hr>

    <h2>Total Due: $${data.total.toFixed(2)}</h2>
  `;
}

/* =========================
   INIT
========================= */

loadProperties();
