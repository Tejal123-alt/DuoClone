/**
 * Duolingo Clone - Shared Application Utilities
 * Auth, stats sync, lesson progression, daily reset, logout
 */
(function ($) {
  'use strict';

  window.DuoApp = {

    /* ─── Authentication ─── */
    isLoggedIn: function () {
      return !!(localStorage.getItem('userName') && localStorage.getItem('userPassword'));
    },

    requireAuth: function (redirectTo) {
      if (!this.isLoggedIn()) {
        if (typeof showDuoModal === 'function') {
          showDuoModal({
            title: 'Please Log In',
            message: 'You need to be signed in to access this page. Log in or create a free account to continue learning!',
            type: 'warning',
            buttonText: 'LOG IN',
            cancelText: 'SIGN UP',
            onConfirm: function () { window.location.href = redirectTo || 'login.html'; },
            onCancel: function () { window.location.href = 'signup.html'; }
          });
        } else {
          window.location.href = redirectTo || 'index.html';
        }
        return false;
      }
      return true;
    },

    /* ─── Stats Management ─── */
    getStats: function () {
      this.checkDailyReset();
      this.checkHeartRegen();
      return {
        userName:    localStorage.getItem('userName') || 'Learner',
        userLanguage: localStorage.getItem('userLanguage') || 'Spanish',
        userStreak:  parseInt(localStorage.getItem('userStreak') || '0', 10),
        userXP:      parseInt(localStorage.getItem('userXP') || '0', 10),
        userGems:    parseInt(localStorage.getItem('userGems') || '100', 10),
        userHearts:  parseInt(localStorage.getItem('userHearts') || '5', 10),
        dailyXP:     parseInt(localStorage.getItem('dailyXP') || '0', 10),
        dailyGoal:   localStorage.getItem('dailyGoal') || 'Regular'
      };
    },

    syncStats: function (selectors) {
      var stats = this.getStats();
      var s = $.extend({
        streak: '#streakCount, #streakCountSidebar',
        gems:   '#gemsCount, #gemsWallet',
        hearts: '#heartsCount, #heartsRemainingText',
        xp:     '#xpCount'
      }, selectors || {});

      $(s.streak).text(stats.userStreak);
      $(s.gems).text(stats.userGems);
      $(s.hearts).text(stats.userHearts);
      $(s.xp).text(stats.userXP + ' XP');

      return stats;
    },

    getGoalThreshold: function (goalName) {
      var map = { Casual: 5, Regular: 10, Serious: 15, Intense: 20 };
      return map[goalName || localStorage.getItem('dailyGoal') || 'Regular'] || 10;
    },

    updateDailyGoalUI: function () {
      var stats = this.getStats();
      var threshold = this.getGoalThreshold(stats.dailyGoal);
      var pct = Math.min(100, Math.round((stats.dailyXP / threshold) * 100));

      if ($('#dailyGoalText').length) {
        if (pct >= 100) {
          $('#dailyGoalText').html('<i class="bi bi-check-circle-fill text-success me-1"></i> Daily Goal Met!');
        } else {
          $('#dailyGoalText').text('Practice goal: ' + stats.dailyXP + '/' + threshold + ' XP today');
        }
      }
      if ($('#dailyGoalProgress').length) {
        $('#dailyGoalProgress').css('width', pct + '%');
      }
    },

    /* ─── Daily Reset & Heart Regen ─── */
    checkDailyReset: function () {
      var today = new Date().toDateString();
      var lastDate = localStorage.getItem('lastPracticeDate');

      if (lastDate && lastDate !== today) {
        var streak = parseInt(localStorage.getItem('userStreak') || '0', 10);
        var hadFreeze = localStorage.getItem('purchasedStreakFreeze') === 'true';

        if (hadFreeze) {
          localStorage.removeItem('purchasedStreakFreeze');
        } else if (streak > 0) {
          localStorage.setItem('userStreak', '0');
        }

        localStorage.setItem('dailyXP', '0');
      }
    },

    checkHeartRegen: function () {
      var hearts = parseInt(localStorage.getItem('userHearts') || '5', 10);
      if (hearts >= 5) return;

      var lastRegen = parseInt(localStorage.getItem('lastHeartRegen') || '0', 10);
      var now = Date.now();
      var regenInterval = 4 * 60 * 60 * 1000; // 4 hours per heart

      if (!lastRegen) {
        localStorage.setItem('lastHeartRegen', String(now));
        return;
      }

      var elapsed = now - lastRegen;
      var heartsToAdd = Math.floor(elapsed / regenInterval);

      if (heartsToAdd > 0) {
        var newHearts = Math.min(5, hearts + heartsToAdd);
        localStorage.setItem('userHearts', String(newHearts));
        localStorage.setItem('lastHeartRegen', String(now - (elapsed % regenInterval)));
      }
    },

    recordPracticeDay: function () {
      localStorage.setItem('lastPracticeDate', new Date().toDateString());
    },

    /* ─── Lesson Progression ─── */
    getCompletedLessons: function () {
      try {
        return JSON.parse(localStorage.getItem('completedLessons') || '[]');
      } catch (e) {
        return [];
      }
    },

    getActiveLessonNode: function () {
      var completed = this.getCompletedLessons();
      for (var i = 1; i <= 5; i++) {
        if (completed.indexOf(i) === -1) return i;
      }
      return null;
    },

    completeLessonNode: function (nodeId) {
      var completed = this.getCompletedLessons();
      if (completed.indexOf(nodeId) === -1) {
        completed.push(nodeId);
        localStorage.setItem('completedLessons', JSON.stringify(completed));
      }
      this.recordPracticeDay();

      var streak = parseInt(localStorage.getItem('userStreak') || '0', 10);
      var lastStreakDate = localStorage.getItem('lastStreakDate');
      var today = new Date().toDateString();

      if (lastStreakDate !== today) {
        localStorage.setItem('userStreak', String(streak + 1));
        localStorage.setItem('lastStreakDate', today);
      }
    },

    applyLessonPathState: function () {
      var completed = this.getCompletedLessons();
      var activeNode = this.getActiveLessonNode();

      $('.lesson-node').each(function () {
        var $node = $(this);
        var nodeId = parseInt($node.data('node'), 10);
        var $item = $node.closest('.lesson-node-item');

        $node.removeClass('completed active locked');
        $item.find('.lesson-crown').remove();

        if (completed.indexOf(nodeId) !== -1) {
          $node.addClass('completed').html('<i class="bi bi-check-lg"></i>');
        } else if (nodeId === activeNode) {
          $node.addClass('active').text(nodeId === 3 ? '1' : String(nodeId - 2));
          if (nodeId === 3) {
            $item.prepend('<i class="bi bi-crown-fill lesson-crown"></i>');
          }
        } else if (nodeId > activeNode || activeNode === null) {
          $node.addClass('locked').html('<i class="bi bi-lock-fill"></i>');
        }
      });
    },

    /* ─── Logout ─── */
    bindLogout: function (selector) {
      $(document).on('click', selector || '#logoutBtnSidebar', function () {
        showDuoModal({
          title: 'Confirm Logout',
          message: 'Are you sure you want to sign out? Your streaks and XP will remain saved locally.',
          type: 'warning',
          buttonText: 'LOG OUT',
          cancelText: 'CANCEL',
          onConfirm: function () {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace('index.html');
          }
        });
      });
    },

    /* ─── Guidebook Modal ─── */
    showGuidebook: function (unitTitle) {
      showDuoModal({
        title: unitTitle || 'Unit Guidebook',
        message: 'Review key vocabulary and grammar tips for this unit. Phrases include greetings, introductions, and common expressions to help you practice offline.',
        type: 'motivation',
        buttonText: 'GOT IT'
      });
    },

    /* ─── Init for App Pages ─── */
    initAppPage: function (options) {
      options = options || {};
      if (options.requireAuth !== false && !this.requireAuth()) return false;

      this.syncStats(options.selectors);
      this.updateDailyGoalUI();
      this.bindLogout(options.logoutSelector);

      var stats = this.getStats();
      if (stats.userLanguage && $('.unit-title').length) {
        $('.unit-title').first().text(stats.userLanguage + ' Course - Unit 1');
      }
      return true;
    }
  };

  /* Ripple effect for all .ripple buttons */
  $(document).on('click', '.ripple', function () {
    /* CSS handles visual ripple via :active pseudo */
  });

  /* Scroll-triggered animations */
  $(document).ready(function () {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            $(entry.target).addClass('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      $('.animate-on-scroll').each(function () { observer.observe(this); });
    } else {
      $('.animate-on-scroll').addClass('visible');
    }
  });

})(jQuery);
