// shop.js - Handles purchase logic for shop items
document.addEventListener('DOMContentLoaded', function () {
  // Helper to get current gem balance
  function getGemBalance() {
    var walletEl = document.getElementById('gemsWallet') || document.getElementById('gemsCount');
    var val = walletEl ? parseInt(walletEl.textContent.replace(/\D/g, ''), 10) : 0;
    return isNaN(val) ? 0 : val;
  }

  function setGemBalance(newBalance) {
    var walletEl = document.getElementById('gemsWallet');
    if (walletEl) walletEl.textContent = newBalance;
    var headerEl = document.getElementById('gemsCount');
    if (headerEl) headerEl.textContent = newBalance;
    // Persist to localStorage for future pages
    localStorage.setItem('gemBalance', newBalance);
  }

  // Initialise from storage if present
  var storedBalance = localStorage.getItem('gemBalance');
  if (storedBalance !== null) {
    setGemBalance(parseInt(storedBalance, 10));
  }

  // Click handler for all shop buttons
  document.querySelectorAll('.shop-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cost = parseInt(btn.getAttribute('data-cost'), 10) || 0;
      var itemId = btn.id;
      var outfit = btn.getAttribute('data-outfit'); // may be null
      var purchaseKey = 'purchased_' + itemId;

      // Prevent duplicate purchase
      if (localStorage.getItem(purchaseKey) === 'true') {
        window.showDuoModal({
          title: 'Already Owned',
          message: 'You have already purchased this item.',
          type: 'warning',
          buttonText: 'OK'
        });
        return;
      }

      var balance = getGemBalance();
      if (balance < cost) {
        window.showDuoModal({
          title: 'Not Enough Gems',
          message: 'You need ' + cost + ' gems to buy this item. Earn more or visit the shop.',
          type: 'error',
          buttonText: 'OK'
        });
        return;
      }

      // Deduct gems
      var newBalance = balance - cost;
      setGemBalance(newBalance);

      // Mark as purchased
      localStorage.setItem(purchaseKey, 'true');

      // Success modal
      window.showDuoModal({
        title: 'Purchase Successful',
        message: 'You have purchased the item! Enjoy your new upgrade.',
        type: 'success',
        buttonText: 'Great!'
      });
    });
  });
});
