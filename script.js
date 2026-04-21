let properties = {};
let sheetData = [];

/* =========================
   1. LOAD PROPERTIES FROM SHEET
========================= */

async function loadProperties() {
  try {
    const res = await fetch(https://sheetdb.io/api/v1/6w8tib81woerj);
    sheetData = await res.json();

    const select = document.getElementById("property");
    select.innerHTML = "";

    properties = {};

    sheetData.forEach(row => {
      const name = row["Property Name"];

      const charges =
        row[
          "Charge type and amount to be added (If charge already appears in the recurring charges after moving tenant in no action needed)"
        ] || "";

      properties[name] = {
        charges: charges
      };

      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;

      select.appendChild(option);
    });

    console.log("Properties loaded:", properties);
  } catch (err) {
    console.error("Error loading sheet:", err);
  }
}

/* =========================
   2. PARSE MULTI-LINE CHARGES
========================= */

function parseCharges(text) {
  if (!text) return [];

  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.includes(":"))
    .map(line => {
      const [type, value] = line.split(":");

      return {
        type: type.trim(),
        value: value.trim()
      };
    });
}

/* =========================
   3. CALCULATE UTILITIES
========================= */

function calculateUtilities(chargesText) {
  const charges = parseCharges(chargesText);

  let total = 0;

  charges.forEach(c => {
    const num = parseFloat(c.value.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) total += num;
  });

  return total;
}

/* =========================
   4. PRORATED RENT
========================= */

function calculateProratedRent(rent, moveInDate) {
  const date = new Date(moveInDate);

  const year = date.getFullYear();
  const month = date.getMonth();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const moveInDay = date.getDate();

  const remainingDays = totalDays - moveInDay + 1;

  return (remainingDays / totalDays) * rent;
}

/* =========================
   5. MAIN CALCULATOR
========================= */

function calculate() {
  const propertyName = document.getElementById("property").value;
  const rent = parseFloat(document.getElementById("rent").value);
  const moveIn = document.getElementById("moveIn").value;
  const pets = parseInt(document.getElementById("pets").value) || 0;

  if (!propertyName || !rent || !moveIn) {
    alert("Please fill all required fields.");
    return;
  }

  const property = properties[propertyName];

  const proratedRent = calculateProratedRent(rent, moveIn);

  const utilitiesTotal = calculateUtilities(property.charges);

  const petRent = pets * 40;       // adjust if needed
  const petDeposit = pets * 300;   // adjust if needed

  const total =
    proratedRent +
    utilitiesTotal +
    petRent +
    petDeposit;

  /* =========================
     OUTPUT BREAKDOWN
  ========================= */

  document.getElementById("result").innerHTML = `
    <h3>Breakdown</h3>

    <p><b>Property:</b> ${propertyName}</p>

    <p><b>Prorated Rent:</b> $${proratedRent.toFixed(2)}</p>

    <p><b>Utilities Total:</b> $${utilitiesTotal.toFixed(2)}</p>

    <p><b>Pet Rent:</b> $${petRent.toFixed(2)}</p>

    <p><b>Pet Deposit:</b> $${petDeposit.toFixed(2)}</p>

    <hr>

    <h2>Total Due: $${total.toFixed(2)}</h2>
  `;
}

/* =========================
   INIT
========================= */

loadProperties();
