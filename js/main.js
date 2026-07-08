/* Ironwood Construction Co. — site behaviour
   Mobile menu · sticky header state · project filter · form validation · scroll reveal */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.getElementById('site-nav');
  var navOverlay = document.querySelector('.nav-overlay');

  function setMenu(open) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    siteNav.classList.toggle('is-open', open);
    if (navOverlay) navOverlay.classList.toggle('is-visible', open);
    document.body.classList.toggle('menu-open', open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', function () { setMenu(false); });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });

    // Close the panel when a nav link is chosen (same-page anchors etc.)
    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     Sticky header shadow
     ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Project gallery filter
     ------------------------------------------------------------------ */
  var filterBar = document.querySelector('.filter-bar');
  var projectCards = document.querySelectorAll('[data-category]');

  if (filterBar && projectCards.length) {
    filterBar.addEventListener('click', function (event) {
      var button = event.target.closest('.filter-btn');
      if (!button) return;

      filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn === button));
      });

      var filter = button.dataset.filter;
      projectCards.forEach(function (card) {
        var show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* ------------------------------------------------------------------
     Quote form validation
     ------------------------------------------------------------------ */
  var form = document.getElementById('quote-form');

  if (form) {
    var successBox = document.getElementById('form-success');

    var validators = {
      name: function (value) {
        if (!value.trim()) return 'Enter your name so we know who to contact.';
        return '';
      },
      email: function (value) {
        if (!value.trim()) return 'Enter an email address so we can send your quote.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
          return 'That email address doesn’t look right — check for typos.';
        }
        return '';
      },
      phone: function (value) {
        if (!value.trim()) return 'Enter a phone number — we confirm every quote by phone.';
        if (!/^[\d\s()+.-]{7,20}$/.test(value.trim())) {
          return 'Use digits, spaces, and ( ) + - . only.';
        }
        return '';
      },
      'project-type': function (value) {
        if (!value) return 'Choose the option closest to your project.';
        return '';
      },
      message: function (value) {
        if (!value.trim()) return 'Tell us a little about the project — a sentence or two is plenty.';
        if (value.trim().length < 20) return 'Add a bit more detail (at least 20 characters).';
        return '';
      },
      consent: function (_value, field) {
        if (!field.checked) return 'Check this box so we’re allowed to contact you.';
        return '';
      }
    };

    function setFieldState(field, message) {
      var errorEl = document.getElementById(field.id + '-error');
      var invalid = Boolean(message);
      field.setAttribute('aria-invalid', String(invalid));
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.toggle('is-visible', invalid);
      }
      return !invalid;
    }

    function validateField(field) {
      var validator = validators[field.name];
      if (!validator) return true;
      return setFieldState(field, validator(field.value, field));
    }

    form.addEventListener('submit', function (event) {
      var fields = Array.prototype.slice.call(
        form.querySelectorAll('input, select, textarea')
      );
      var firstInvalid = null;

      fields.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        event.preventDefault();
        if (successBox) successBox.classList.remove('is-visible');
        firstInvalid.focus();
        return;
      }

      // Validation passed — let Formspree handle the submission.
      // The form will POST to Formspree, which sends the email and redirects back.
    });

    // Clear an error as soon as the person fixes the field.
    form.addEventListener('input', function (event) {
      var field = event.target;
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    form.addEventListener('change', function (event) {
      var field = event.target;
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal (skipped for reduced motion)
     ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length && !reduceMotion && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
