const bikes = [
  { id: "B101", name: "City Scooter", type: "Scooter", price: 500, icon: "🛵" },
  { id: "B102", name: "Urban Commuter", type: "Commuter", price: 700, icon: "🏍️" },
  { id: "B103", name: "Street Sports", type: "Sports", price: 1500, icon: "🏍️" },
  { id: "B104", name: "Classic Cruiser", type: "Cruiser", price: 1200, icon: "🏍️" },
  { id: "B105", name: "Daily Rider", type: "Commuter", price: 650, icon: "🏍️" },
  { id: "B106", name: "Easy Scooter", type: "Scooter", price: 450, icon: "🛵" }
];

const bikeList = document.getElementById("bikeList");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const resultCount = document.getElementById("resultCount");
const emptyMessage = document.getElementById("emptyMessage");

const bikeIdInput = document.getElementById("bikeId");
const selectedBike = document.getElementById("selectedBike");
const pickupDate = document.getElementById("pickupDate");
const returnDate = document.getElementById("returnDate");
const customerName = document.getElementById("customerName");
const totalCost = document.getElementById("totalCost");
const costNote = document.getElementById("costNote");
const formMessage = document.getElementById("formMessage");

const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

pickupDate.min = todayString;
returnDate.min = todayString;

function getSelectedBike() {
  return bikes.find(bike => bike.id === bikeIdInput.value);
}

function calculateDays() {
  if (!pickupDate.value || !returnDate.value) return 0;

  const start = new Date(pickupDate.value + "T00:00:00");
  const end = new Date(returnDate.value + "T00:00:00");
  const difference = end - start;

  if (difference <= 0) return 0;

  return Math.round(difference / 86400000);
}

function updateCost() {
  const bike = getSelectedBike();
  const days = calculateDays();

  if (!bike || days < 1) {
    totalCost.textContent = "₹0";
    costNote.textContent = "Choose a bike and a valid date range.";
    return;
  }

  totalCost.textContent = "₹" + (bike.price * days).toLocaleString("en-IN");
  costNote.textContent =
    `${days} day(s) × ₹${bike.price.toLocaleString("en-IN")} per day`;
}

function renderBikes() {
  const query = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;

  const filteredBikes = bikes.filter(bike => {
    const matchesSearch =
      bike.name.toLowerCase().includes(query) ||
      bike.type.toLowerCase().includes(query);

    const matchesType = type === "all" || bike.type === type;

    return matchesSearch && matchesType;
  });

  resultCount.textContent = `${filteredBikes.length} bike(s)`;
  emptyMessage.hidden = filteredBikes.length !== 0;

  bikeList.innerHTML = filteredBikes.map(bike => `
    <article class="bike-card">
      <div class="bike-illustration" aria-hidden="true">${bike.icon}</div>
      <span class="bike-type">${bike.type}</span>
      <h3>${bike.name}</h3>
      <p class="bike-price">
        ₹${bike.price.toLocaleString("en-IN")}
        <small>/ day</small>
      </p>
      <button class="primary-button" type="button"
        data-bike-id="${bike.id}">
        Select Bike
      </button>
    </article>
  `).join("");
}

bikeList.addEventListener("click", event => {
  const button = event.target.closest("[data-bike-id]");
  if (!button) return;

  const bike = bikes.find(item => item.id === button.dataset.bikeId);
  if (!bike) return;

  bikeIdInput.value = bike.id;
  selectedBike.textContent =
    `${bike.name} — ₹${bike.price.toLocaleString("en-IN")} per day`;

  formMessage.textContent = "";
  updateCost();

  document.getElementById("bookingPanel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

searchInput.addEventListener("input", renderBikes);
typeFilter.addEventListener("change", renderBikes);
pickupDate.addEventListener("change", () => {
  returnDate.min = pickupDate.value || todayString;

  if (returnDate.value && returnDate.value <= pickupDate.value) {
    returnDate.value = "";
  }

  updateCost();
});
returnDate.addEventListener("change", updateCost);

document.getElementById("bookingForm").addEventListener("submit", event => {
  event.preventDefault();
  formMessage.textContent = "";

  const bike = getSelectedBike();
  const name = customerName.value.trim();
  const days = calculateDays();

  if (!bike) {
    formMessage.textContent = "Please select a bike first.";
    return;
  }

  if (!name) {
    formMessage.textContent = "Please enter your name.";
    return;
  }

  if (pickupDate.value < todayString || days < 1) {
    formMessage.textContent =
      "Please select valid rental dates. Return date must be after pickup.";
    return;
  }

  const booking = {
    bookingId: "RE" + Date.now().toString().slice(-8),
    customerName: name,
    vehicleType: "Bike",
    vehicleId: bike.id,
    vehicleName: bike.name,
    pickupDate: pickupDate.value,
    returnDate: returnDate.value,
    days,
    totalCost: bike.price * days,
    status: "Confirmed",
    createdAt: new Date().toISOString()
  };

  try {
    const bookings = JSON.parse(
      localStorage.getItem("rentalEaseBikeBookings") || "[]"
    );

    if (!Array.isArray(bookings)) {
      throw new Error("Invalid booking data");
    }

    bookings.push(booking);
    localStorage.setItem(
      "rentalEaseBikeBookings",
      JSON.stringify(bookings)
    );

    formMessage.textContent =
      `Booking confirmed! Your booking ID is ${booking.bookingId}. ` +
      "Sample booking saved in this browser.";
  } catch (error) {
    formMessage.textContent =
      "Booking could not be saved. Please check browser storage settings.";
  }
});

renderBikes();
updateCost();