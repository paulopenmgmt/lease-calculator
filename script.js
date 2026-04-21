let properties = {};

fetch("properties.json")
  .then(res => res.json())
  .then(data => {
    properties = data;

    const select = document.getElementById("property");

    Object.keys(properties).forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      select.appendChild(option);
    });
  });

function calculate() {

  const propertyName = document.getElementById("property").value;
  const rent = parseFloat(document.getElementById("rent").value);
  const moveIn = new Date(document.getElementById("moveIn").value);
  const pets = parseInt(document.getElementById("pets").value) || 0;

  const property = properties[propertyName];

  // Days in month
  const year = moveIn.getFullYear();
  const month = moveIn.getMonth();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const moveInDay = moveIn.getDate();

  const remainingDays = totalDays - moveInDay + 1;

  const proratedRent = (remainingDays / totalDays) * rent;

  const utilities = property.utilities;
  const petRent = property.petRent * pets;
  const petDeposit = property.petDeposit * pets;

  const totalDue =
      proratedRent +
      utilities +
      petDeposit +
      petRent;

  document.getElementById("result").innerHTML = `
    <p>Prorated Rent: $${proratedRent.toFixed(2)}</p>
    <p>Utilities: $${utilities.toFixed(2)}</p>
    <p>Pet Rent: $${petRent.toFixed(2)}</p>
    <p>Pet Deposit: $${petDeposit.toFixed(2)}</p>
    <hr>
    <h3>Total Due: $${totalDue.toFixed(2)}</h3>
  `;
}
