$(document).ready(function () {
  if (!DuoApp.initAppPage()) return;

  var stats = DuoApp.getStats();
  DuoApp.applyLessonPathState();

  var activeNode = null;

  function positionPopover($node) {
    var $popover = $('#lessonPopover');
    var nodeOffset = $node.offset();
    var wrapperOffset = $('.lesson-path-wrapper').offset();
    var nodeWidth = $node.outerWidth();
    var nodeHeight = $node.outerHeight();
    var popoverWidth = $popover.outerWidth() || 240;
    var isMobile = window.innerWidth < 768;

    var left, top;

    if (isMobile) {
      left = ($('.lesson-path-wrapper').width() - popoverWidth) / 2;
      top = $node.position().top + nodeHeight + 12;
    } else {
      left = $node.position().left + (nodeWidth / 2) - (popoverWidth / 2);
      top = $node.position().top + nodeHeight + 12;
    }

    $popover.css({ top: top + 'px', left: left + 'px', transform: 'none' });
  }

  $('.lesson-node').on('click', function (e) {
    e.stopPropagation();
    var $node = $(this);

    if ($node.hasClass('locked')) {
      showDuoModal({
        title: 'Lesson Locked',
        message: 'Complete the previous lessons first to unlock this one. Keep going — you\'re doing great!',
        type: 'warning',
        buttonText: 'GOT IT'
      });
      $('#lessonPopover').fadeOut(150);
      return;
    }

    activeNode = $node.data('node');
    $('#popoverTitle').text($node.data('title'));
    $('#popoverDesc').text($node.data('desc'));

    positionPopover($node);
    $('#lessonPopover').stop(true, true).fadeIn(200);
  });

  $(window).on('resize', function () {
    if ($('#lessonPopover').is(':visible') && activeNode) {
      positionPopover($('.lesson-node[data-node="' + activeNode + '"]'));
    }
  });

  $('#startLessonBtn').on('click', function () {
    if (stats.userHearts <= 0) {
      showDuoModal({
        title: 'No Hearts Left!',
        message: 'You can\'t start a lesson with 0 hearts. Refill them in the shop or wait for them to regenerate!',
        type: 'error',
        buttonText: 'VISIT SHOP',
        cancelText: 'CLOSE',
        onConfirm: function () { window.location.href = 'shop.html'; }
      });
      return;
    }

    localStorage.setItem('currentLessonNode', String(activeNode || DuoApp.getActiveLessonNode() || 3));

    showDuoModal({
      title: 'Start Lesson?',
      message: 'Ready to practice? Complete the exercises to earn +20 XP and gems!',
      type: 'motivation',
      buttonText: 'START',
      cancelText: 'CANCEL',
      onConfirm: function () { window.location.href = 'lesson1.html'; }
    });
  });

  $('.unit-guidebook-btn:not(.disabled)').on('click', function (e) {
    e.preventDefault();
    var title = $(this).closest('.unit-banner').find('.unit-title').text();
    DuoApp.showGuidebook(title);
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('#lessonPopover, .lesson-node').length) {
      $('#lessonPopover').fadeOut(150);
    }
  });

// Logout handled by common script (see js/logout.js)
});
