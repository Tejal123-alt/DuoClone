// Duolingo-Style Custom Popup Modal Engine
(function () {
  'use strict';

  var modalStyles = [
    '.duo-modal-overlay {',
    '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
    '  background-color: rgba(0,0,0,0.45); display: flex; justify-content: center; align-items: center;',
    '  z-index: 99999; backdrop-filter: blur(3px); opacity: 0; transition: opacity 0.2s ease-out;',
    '}',
    '.duo-modal-overlay.active { opacity: 1; }',
    '.duo-modal-card {',
    '  background: #fff; border: 2px solid #e5e5e5; border-radius: 20px; padding: 32px 24px;',
    '  width: 90%; max-width: 420px; text-align: center;',
    '  box-shadow: 0 20px 60px rgba(0,0,0,0.15); transform: scale(0.85) translateY(16px);',
    '  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); position: relative;',
    '}',
    '.duo-modal-overlay.active .duo-modal-card { transform: scale(1) translateY(0); }',
    '.duo-modal-icon-wrapper {',
    '  width: 80px; height: 80px; margin: 0 auto 20px; display: flex;',
    '  justify-content: center; align-items: center; border-radius: 50%; font-size: 40px;',
    '}',
    '.duo-modal-success-icon { background: #E9F7D8; color: #58CC02; border: 3px solid #58CC02; }',
    '.duo-modal-error-icon { background: #FEE7E7; color: #FF4B4B; border: 3px solid #FF4B4B; }',
    '.duo-modal-warning-icon { background: #FFF5D6; color: #FF9600; border: 3px solid #FF9600; }',
    '.duo-modal-info-icon { background: #DDF4FF; color: #1CB0F6; border: 3px solid #1CB0F6; }',
    '.duo-modal-title { font-family: Nunito, sans-serif; font-size: 24px; font-weight: 900; color: #3C3C3C; margin-bottom: 12px; }',
    '.duo-modal-message { font-family: Nunito, sans-serif; font-size: 16px; color: #777; margin-bottom: 24px; line-height: 1.5; font-weight: 600; }',
    '.duo-modal-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }',
    '.duo-modal-btn { position: relative; border: none; border-radius: 12px; font-family: Nunito, sans-serif;',
    '  font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 0.8px;',
    '  padding: 12px 24px; outline: none !important; cursor: pointer; min-width: 120px;',
    '  transition: transform 0.1s ease, box-shadow 0.1s ease; user-select: none;',
    '}',
    '.duo-modal-btn-green { background: #58CC02; color: #fff; box-shadow: 0 4px 0 #46A302; }',
    '.duo-modal-btn-green:active { transform: translateY(4px); box-shadow: 0 0 0 #46A302; }',
    '.duo-modal-btn-red { background: #FF4B4B; color: #fff; box-shadow: 0 4px 0 #EA2B2B; }',
    '.duo-modal-btn-red:active { transform: translateY(4px); box-shadow: 0 0 0 #EA2B2B; }',
    '.duo-modal-btn-white { background: #fff; color: #1CB0F6; border: 2px solid #e5e5e5; box-shadow: 0 4px 0 #e5e5e5; }',
    '.duo-modal-btn-white:active { transform: translateY(4px); box-shadow: 0 0 0 #e5e5e5; }',
    '.duo-modal-mascot { width: 90px; height: 90px; margin: 0 auto 15px; animation: waddle 1.5s ease-in-out infinite alternate; }',
    '.duo-modal-loading-spinner { width: 48px; height: 48px; border: 4px solid #e5e5e5; border-top-color: #58CC02;',
    '  border-radius: 50%; animation: duoSpin 0.8s linear infinite; margin: 0 auto 20px; }',
    '@keyframes waddle { 0% { transform: rotate(-5deg) translateY(0); } 100% { transform: rotate(5deg) translateY(-5px); } }',
    '@keyframes duoSpin { to { transform: rotate(360deg); } }'
  ].join('\n');

  var mascotSvg = [
    '<svg class="duo-modal-mascot" viewBox="0 0 100 100" aria-hidden="true">',
    '<circle cx="50" cy="50" r="45" fill="#58CC02"/>',
    '<circle cx="35" cy="40" r="12" fill="white"/><circle cx="65" cy="40" r="12" fill="white"/>',
    '<circle cx="35" cy="40" r="5" fill="black"/><circle cx="65" cy="40" r="5" fill="black"/>',
    '<polygon points="50,48 45,55 55,55" fill="#FFA500"/>',
    '<path d="M 30,70 Q 50,85 70,70" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/>',
    '</svg>'
  ].join('');

  function injectAssets() {
    if (!$('#duo-modal-styles').length) {
      $('<style id="duo-modal-styles">').text(modalStyles).appendTo('head');
    }
    if ($('link[href*="fonts.googleapis.com"]').length === 0) {
      $('head').append(
        '<link rel="preconnect" href="https://fonts.googleapis.com">' +
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
        '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap" rel="stylesheet">'
      );
    }
    if ($('link[href*="bootstrap-icons"]').length === 0) {
      $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">');
    }
  }

  function closeModal($overlay, callback) {
    $overlay.removeClass('active');
    $(document).off('keydown.duoModal');
    setTimeout(function () {
      $overlay.remove();
      if (typeof callback === 'function') callback();
    }, 250);
  }

  window.showDuoModal = function (options) {
    options = options || {};
    injectAssets();
    $('.duo-modal-overlay').remove();

    var iconHtml = '';
    if (options.type === 'success') {
      iconHtml = '<div class="duo-modal-icon-wrapper duo-modal-success-icon"><i class="bi bi-check-lg"></i></div>';
    } else if (options.type === 'error') {
      iconHtml = '<div class="duo-modal-icon-wrapper duo-modal-error-icon"><i class="bi bi-x-lg"></i></div>';
    } else if (options.type === 'warning') {
      iconHtml = '<div class="duo-modal-icon-wrapper duo-modal-warning-icon"><i class="bi bi-exclamation-triangle-fill"></i></div>';
    } else if (options.type === 'info') {
      iconHtml = '<div class="duo-modal-icon-wrapper duo-modal-info-icon"><i class="bi bi-info-lg"></i></div>';
    } else if (options.type === 'loading') {
      iconHtml = '<div class="duo-modal-loading-spinner" role="status" aria-label="Loading"></div>';
    } else if (options.type === 'motivation') {
      iconHtml = mascotSvg;
    }

    var $overlay = $('<div class="duo-modal-overlay" role="dialog" aria-modal="true"></div>');
    var $card = $('<div class="duo-modal-card"></div>');

    $card.append(iconHtml);
    $card.append('<h3 class="duo-modal-title">' + (options.title || 'Notification') + '</h3>');
    $card.append('<div class="duo-modal-message">' + (options.message || '') + '</div>');

    var $actions = $('<div class="duo-modal-actions"></div>');

    if (options.type !== 'loading') {
      if (options.cancelText) {
        var $cancel = $('<button type="button" class="duo-modal-btn duo-modal-btn-white">' + options.cancelText + '</button>');
        $cancel.on('click', function () {
          closeModal($overlay, options.onCancel);
        });
        $actions.append($cancel);
      }

      var btnClass = options.type === 'error' ? 'duo-modal-btn-red' : 'duo-modal-btn-green';
      var $confirm = $('<button type="button" class="duo-modal-btn ' + btnClass + '">' + (options.buttonText || 'CONTINUE') + '</button>');
      $confirm.on('click', function () {
        closeModal($overlay, options.onConfirm);
      });
      $actions.append($confirm);
      $card.append($actions);
    }

    $overlay.append($card);
    $('body').append($overlay);

    if (options.closeOnOverlay !== false && options.type !== 'loading') {
      $overlay.on('click', function (e) {
        if ($(e.target).is('.duo-modal-overlay')) {
          closeModal($overlay, options.onCancel);
        }
      });
    }

    $(document).on('keydown.duoModal', function (e) {
      if (e.key === 'Escape' && options.type !== 'loading') {
        closeModal($overlay, options.onCancel);
      }
    });

    setTimeout(function () { $overlay.addClass('active'); }, 50);

    return {
      close: function () { closeModal($overlay); }
    };
  };

  window.showDuoLoading = function (title, message) {
    return showDuoModal({
      title: title || 'Loading...',
      message: message || 'Please wait a moment.',
      type: 'loading',
      closeOnOverlay: false
    });
  };

  $(document).ready(injectAssets);
})();
