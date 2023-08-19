(function (win, doc, nav) {
  function initConsentBanner_() {
    var consentBanner = doc.getElementById("consent-banner");
    if (consentBanner) {
      var button = consentBanner.querySelector("button");
      if (button) {
        button.onclick = function () {
          // 7 days * 24 hours * 60 minutes * 60 seconds = 604800.
          doc.cookie =
            "consent=1; max-age=604800; path=/; samesite=strict; secure";
          consentBanner.style.display = "none";
          initIOSInstallPrompt_(consentBanner);
        };
      }
      if (!doc.cookie.includes("consent=1")) {
        consentBanner.style.display = "block";
      }
    }
    return consentBanner;
  }

  function initIOSInstallPrompt_(consentBanner) {
    var isStandalone =
      ("standalone" in nav && nav.standalone) ||
      win.matchMedia("(display-mode: standalone)").matches;
    if (/ipad|iphone|ipod/.test(nav.userAgent.toLowerCase()) && !isStandalone) {
      if (!(consentBanner && consentBanner.style.display === "block")) {
        var installPrompt = doc.getElementById("ios-pwa-prompt");
        if (installPrompt) {
          installPrompt.style.display = "block";
        }
      }
    }
  }

  function initArchiveImages_(pathname) {
    if (pathname.startsWith("/archive/")) {
      var re = /^\/archive\/(\d+\/\d+\/\d+)/i;
      var date = (pathname.match(re) || [])[1];
      function onerror(e) {
        e.target.parentNode.style.display = "none";
      }

      if (date) {
        var uri = "https://web.archive.org/web/";
        // https://majordigest.com/assets/images/category/YYYY/MM/DD/
        var assets = "https://majordigest.com/assets/images/";
        var prefix = uri + date.replace(/\D+/g, "") + "im_/";
        document.querySelectorAll(".card .image img").forEach(function (img) {
          img.onerror = onerror;
          if (img.src.startsWith(assets)) {
            img.src = prefix + img.src;
          } else if (img.complete && img.naturalHeight === 0) {
            onerror({ target: img });
          }
        });
      }
    }
  }

  function updateHeader_() {
    if (!location.pathname.startsWith("/archive/")) {
      var format = win.Intl && Intl.DateTimeFormat && Intl.DateTimeFormat();
      var options =
        format && format.resolvedOptions && format.resolvedOptions();
      var timeZone = (options && options.timeZone) || "";
      var city = timeZone.split("/").pop().replace(/_+/g, " ");
      city && doc.querySelector("header span").append(city);

      doc.querySelector("header time").textContent =
        new Date().toLocaleDateString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    }
  }

  function init_() {
    if (!nav.userAgent.startsWith("Puppeteer")) {
      updateHeader_();
      initIOSInstallPrompt_(initConsentBanner_());
      "serviceWorker" in nav && nav.serviceWorker.register("/sw.js");
    }

    doc
      .querySelectorAll('a[href="' + location.pathname + '"]')
      .forEach(function (link) {
        link.className = "active";
      });
    initArchiveImages_(location.pathname);

    var year = new Date().getFullYear();
    doc.querySelectorAll(".year").forEach(function (node) {
      node.textContent = year;
    });
  }

  init_();
})(window, document, navigator);
