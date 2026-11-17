// Palestra cat2: configurazione degli strumenti di misura.
// Un campo vuoto = strumento spento. Si riempiono uno alla volta durante le prove.
window.PALESTRA = {
  posthogKey: "",                         // chiave progetto PostHog (org "RIc."), inizia con phc_
  posthogHost: "https://eu.i.posthog.com",
  gaId: "",                               // ID Google Analytics 4, inizia con G-
  fathomSiteId: ""                        // ID sito Fathom (solo durante la prova gratuita)
};

(function () {
  var cfg = window.PALESTRA;
  var KEY = "palestra-consenso";

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }
  function addScript(src, attrs) {
    var s = document.createElement("script");
    s.src = src; s.async = true;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
  }

  // Fathom non usa cookie: parte sempre, senza consenso.
  if (cfg.fathomSiteId) {
    addScript("https://cdn.usefathom.com/script.js", { "data-site": cfg.fathomSiteId, defer: "" });
  }

  // PostHog e Google Analytics usano cookie: partono solo dopo "Accetta".
  function loadCookieTools() {
    if (cfg.posthogKey) {
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled getFeatureFlag onFeatureFlags identify alias people.set people.set_once set_config startSessionRecording stopSessionRecording".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      window.posthog.init(cfg.posthogKey, { api_host: cfg.posthogHost, person_profiles: "identified_only" });
    }
    if (cfg.gaId) {
      addScript("https://www.googletagmanager.com/gtag/js?id=" + cfg.gaId);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", cfg.gaId);
    }
  }

  // Evento personalizzato inviato a tutti gli strumenti accesi.
  window.palestraEvent = function (name, props) {
    if (window.posthog && window.posthog.capture) window.posthog.capture(name, props || {});
    if (window.gtag) window.gtag("event", name, props || {});
    if (window.fathom && window.fathom.trackEvent) window.fathom.trackEvent(name);
  };

  function showBanner() {
    var b = document.getElementById("cookie");
    if (!b) return;
    b.style.display = "flex";
    document.getElementById("cookie-ok").onclick = function () {
      setConsent("si"); b.style.display = "none"; loadCookieTools();
    };
    document.getElementById("cookie-no").onclick = function () {
      setConsent("no"); b.style.display = "none";
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var c = getConsent();
    if (c === "si") loadCookieTools();
    else if (c !== "no") showBanner();

    document.querySelectorAll("[data-event]").forEach(function (el) {
      el.addEventListener("click", function () { window.palestraEvent(el.getAttribute("data-event")); });
    });
  });
})();
