const adverts = [
    "Get the latest iPhone at unbeatable prices!",
    "Huge discounts on Samsung Galaxy phones!",
    "Trade in your old gadget for a new one today!",
    "Accessories now 20% off!",
    "Visit us for exclusive deals on smartwatches!"
];

let advertIndex = 0;
function showAdvert() {
    const advertMessage = document.getElementById('advert-message');
    advertMessage.textContent = adverts[advertIndex];
    advertIndex = (advertIndex + 1) % adverts.length;
}

setInterval(showAdvert, 3000);
window.onload = showAdvert;
