document.addEventListener("DOMContentLoaded", function() {
  // Get item details from session storage
  const item = JSON.parse(sessionStorage.getItem("selectedItem"));
  
  if (item) {
      document.getElementById("item-image").src = item.image;
      document.getElementById("item-name").textContent = item.name;
      document.getElementById("item-description").textContent = item.description;
      document.getElementById("seller-name").textContent = item.seller;
      document.getElementById("item-price").textContent = item.price;
      document.getElementById("watchers").textContent = item.watchers;
      document.getElementById("bid-count").textContent = item.bids;
      startBidTimer(item.bidEndTime);
  }

  // Place bid function
  document.getElementById("place-bid").addEventListener("click", function() {
      const bidAmount = parseFloat(document.getElementById("bid-amount").value);
      
      if (!isNaN(bidAmount) && bidAmount > item.price) {
          alert("Bid placed successfully!");
          // Ideally, update the backend with the new bid
      } else {
          alert("Enter a valid bid amount higher than the current price.");
      }
  });

  // Function to start countdown timer
  function startBidTimer(endTime) {
      const timerElement = document.getElementById("bid-timer");
      const updateTimer = () => {
          const timeLeft = new Date(endTime) - new Date();
          if (timeLeft > 0) {
              const hours = Math.floor(timeLeft / 3600000);
              const minutes = Math.floor((timeLeft % 3600000) / 60000);
              const seconds = Math.floor((timeLeft % 60000) / 1000);
              timerElement.textContent = `${hours}:${minutes}:${seconds}`;
          } else {
              timerElement.textContent = "Auction Ended";
              clearInterval(timerInterval);
          }
      };
      const timerInterval = setInterval(updateTimer, 1000);
      updateTimer();
  }
});
