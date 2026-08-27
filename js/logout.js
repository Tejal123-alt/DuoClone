// Common Logout Handler
$(document).ready(function () {
  // Bind logout click for any button with id #logoutBtnSidebar or class .logout-btn
  $('#logoutBtnSidebar, .logout-btn').on('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    showDuoModal({
      title: 'Confirm Logout',
      message: 'Are you sure you want to sign out? Your progress details will remain saved locally.',
      type: 'warning',
      buttonText: 'LOG OUT',
      cancelText: 'CANCEL',
      onConfirm: function () {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
      }
    });
  });

  // Protect protected pages: if no login session, redirect to index.html
  if (!localStorage.getItem('userName')) {
    window.location.href = "index.html";
  }
});
