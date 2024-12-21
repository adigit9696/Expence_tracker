let expenses = [];
let balances = {};

function updateUI() {
  updateExpenseList();
  updateBalances();
}

document.getElementById("expense-form").addEventListener("submit", function (e) {
  e.preventDefault();


  const payer = document.getElementById("payer").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value.trim();
  const participants = document
    .getElementById("participants")
    .value.split(",")
    .map((name) => name.trim());

  if (!payer || !amount || participants.length < 1) {
    alert("Please fill in all fields correctly!");
    return;
  }

  // Split the amount
  const splitAmount = parseFloat((amount / participants.length).toFixed(2));

  // Update balances
  participants.forEach((participant) => {
    if (participant !== payer) {
      if (!balances[participant]) balances[participant] = 0;
      if (!balances[payer]) balances[payer] = 0;

      balances[participant] -= splitAmount;
      balances[payer] += splitAmount;      
    }
  });

  expenses.push({ payer, amount, description, participants });

  document.getElementById("expense-form").reset();

  updateUI();
});

function updateExpenseList() {
  const expenseList = document.getElementById("expenses");
  expenseList.innerHTML = "";

  expenses.forEach((expense, index) => {
    const li = document.createElement("li");
    li.textContent = `${expense.description}: ₹${expense.amount} (Paid by ${expense.payer}, Participants: ${expense.participants.join(
      ", "
    )})`;
    expenseList.appendChild(li);
  });
}

function updateBalances() {
  const balanceList = document.getElementById("balance-list");
  balanceList.innerHTML = "";

  Object.keys(balances).forEach((person) => {
    const li = document.createElement("li");
    li.textContent = `${person}: ₹${balances[person].toFixed(2)}`;
    balanceList.appendChild(li);
  });
}


document.getElementById("settle-button").addEventListener("click", function () {
  const debts = calculateDebts();
  if (debts.length === 0) {
    alert("All balances are already settled!");
    return;
  }

  let debtSummary = "Here is the summary of debts:\n\n";
  debts.forEach((debt) => {
    debtSummary += `${debt.from} owes ${debt.to}: ₹${debt.amount.toFixed(2)}\n`;
  });

  const confirmed = confirm(`${debtSummary}\nDo you want to settle all balances?`);
  if (confirmed) {
    balances = {};
    updateUI();
  }
});

function calculateDebts() {
  const debts = [];
  const people = Object.keys(balances);

  people.forEach((person) => {
    if (balances[person] > 0) {
      people.forEach((otherPerson) => {
        if (balances[otherPerson] < 0) {
          const amountToSettle = Math.min(balances[person], Math.abs(balances[otherPerson]));
          if (amountToSettle > 0) {
            debts.push({
              from: otherPerson,
              to: person,
              amount: amountToSettle,
            });

            balances[person] -= amountToSettle;
            balances[otherPerson] += amountToSettle;
          }
        }
      });
    }
  });

  return debts;
}

updateUI();
