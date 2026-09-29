/* ============================================================
   SUDA SOLUTIONS — interactions
   ============================================================ */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initRotators();
    initDropdowns();
    initReveal();
    initForms();
    initToTop();
    initChat();
    initYear();
  });

  /* ---------- Sticky header shadow ---------- */
  function initHeader() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav ---------- */
  function initDropdowns() {
    var toggle = $(".nav-toggle");
    var overlay = $(".nav-overlay");
    var mq = window.matchMedia("(max-width: 900px)");

    function close() {
      document.body.classList.remove("nav-open");
      toggle.classList.remove("open");
    }
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.classList.toggle("open", open);
      });
    }
    if (overlay) overlay.addEventListener("click", close);

    /* dropdowns: hover on desktop needs JS only for touch; click for mobile */
    $$(".has-dropdown > a").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (!mq.matches) return; // desktop: let hover handle it; allow anchor default if any
        e.preventDefault();
        var dd = link.parentElement;
        var wasOpen = dd.classList.contains("open");
        $$(".has-dropdown.open").forEach(function (o) { o.classList.remove("open"); });
        if (!wasOpen) dd.classList.add("open");
      });
    });

    $$(".mainnav a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (mq.matches && this.closest(".dropdown-menu")) close();
      });
    });

    var body = document.body;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ---------- Text rotators ---------- */
  function initRotators() {
    $$("[data-rotator]").forEach(function (el) {
      var items = JSON.parse(el.getAttribute("data-rotator"));
      var idx = 0;
      var block = document.createElement("div");
      block.className = "rotator-block";
      items.forEach(function (txt, i) {
        var s = document.createElement("span");
        s.textContent = txt;
        if (i === 0) s.classList.add("current");
        block.appendChild(s);
      });
      el.appendChild(block);
      setInterval(function () {
        var kids = block.children;
        kids[idx].classList.remove("current");
        idx = (idx + 1) % kids.length;
        kids[idx].classList.add("current");
      }, 3600);
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var d = entry.target.getAttribute("data-delay");
          entry.target.style.transitionDelay = d ? d + "ms" : "0ms";
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Static forms: demo submit (with light validation) ---------- */
  function initForms() {
    $$("form[data-static]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var invalid = false;
        $$("[required]", form).forEach(function (el) {
          el.classList.remove("err");
          if (!el.value || el.value.trim() === "") {
            invalid = true;
            el.classList.add("err");
          } else if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
            invalid = true;
            el.classList.add("err");
          }
        });
        if (invalid) return;

        var ok = $(".form-success", form);
        if (ok) {
          ok.classList.add("show");
          ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        form.reset();
        var fileLabel = $(".file-name", form);
        if (fileLabel) fileLabel.textContent = "";
      });
    });

    $$(".file-drop input[type=file]").forEach(function (input) {
      input.addEventListener("change", function () {
        var label = $(".file-name", input.closest(".file-drop"));
        if (label) label.textContent = input.files && input.files[0] ? input.files[0].name : "";
      });
    });
  }

  /* ---------- Back to top ---------- */
  function initToTop() {
    var btn = $("#toTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY > 480) btn.classList.add("show");
      else btn.classList.remove("show");
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Chat bot ---------- */
  function initChat() {
    var launcher = document.createElement("button");
    launcher.className = "chat-launcher";
    launcher.setAttribute("aria-label", "Open chat assistant");
    launcher.innerHTML =
      '<span class="pulse"></span>' +
      '<i class="fa-solid fa-comment-dots icon-chat"></i>' +
      '<i class="fa-solid fa-xmark icon-close"></i>';

    var windowEl = document.createElement("div");
    windowEl.className = "chat-window";
    windowEl.innerHTML =
      '<div class="chat-head">' +
        '<span class="chat-avatar"><i class="fa-solid fa-headset"></i></span>' +
        '<span class="ttl"><b>Suda Solutions Assistant</b><small>Online - usually replies instantly</small></span>' +
        '<button class="chat-close" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>' +
      '</div>' +
      '<div class="chat-body" role="log" aria-live="polite"></div>' +
      '<div class="chat-quick"></div>' +
      '<div class="chat-input-wrap">' +
        '<input class="chat-input" type="text" placeholder="Type your question..." aria-label="Type your question" />' +
        '<button class="chat-send" aria-label="Send message"><i class="fa-solid fa-paper-plane"></i></button>' +
      '</div>';

    document.body.appendChild(launcher);
    document.body.appendChild(windowEl);

    var bodyEl = $(".chat-body", windowEl);
    var quickEl = $(".chat-quick", windowEl);
    var inputEl = $(".chat-input", windowEl);
    var sendEl = $(".chat-send", windowEl);

    /* ---------- conversation data ---------- */
    var quickReplies = ["Our services", "Get a quote", "Careers & jobs", "Contact & support"];

    var intents = [
      {
        match: /cloud|aws|azure|iaas|paas|saas/i,
        reply: "We help you adopt and manage cloud services - IaaS, PaaS and SaaS - on platforms such as AWS. For a tailored cloud plan, request a free quote: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /network|router|switch|firewall|wifi|wireless|infrastructure/i,
        reply: "Our Network Setup and Management service covers design, implementation and maintenance of routers, switches, firewalls and wireless access points. Get a free quote: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /consult|advice|strategy|align/i,
        reply: "Our IT Consulting service provides strategic guidance to align your technology with your goals. Let's discuss your objectives - request a free quote: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /project|deliver|manage/i,
        reply: "We manage IT projects end to end - planning, execution and implementation - on time and within budget. See details: https://www.sudasolutions.com/services.html#project-management"
      },
      {
        match: /software|app|application|custom|develop|react|angular|java|php|wordpress|joomla|ecommerce|mobile/i,
        reply: "Our team develops custom software with Java, PHP, React and Angular, plus WordPress, Joomla, ecommerce and mobile apps. Tell us what you need via a free quote: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /device|mdm|mobile management|phone management|iphone|android/i,
        reply: "Mobile Device Management (MDM) lets you secure and manage smartphones and tablets used across your organisation. More here: https://www.sudasolutions.com/services.html#mdm"
      },
      {
        match: /telecom|voice|video|call|unified communic/i,
        reply: "Unified Telecommunications brings voice, video, instant messaging and email together in one collaborative environment. More info: https://www.sudasolutions.com/services.html#telecom"
      },
      {
        match: /seo|marketing|ppc|social|content|digital marketing/i,
        reply: "Our digital marketing services cover SEO, PPC, social media and content to promote your products to a wider audience. Request a quote: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /security|cyber|hack|ransom/i,
        reply: "We help protect your business - from secure infrastructure and MDM to best-practice cyber hardening. Talk to our team: https://www.sudasolutions.com/services.html or email info@sudasolutions.com."
      },
      {
        match: /price|quote|estimate|cost|budget|pricing|free quote/i,
        reply: "You can get a free, no-obligation estimate in minutes. Head to our quote form and tell us about your project: https://www.sudasolutions.com/services.html#quote"
      },
      {
        match: /career|job|vacanc|apprentic|training|hiring|join|resume|cv/i,
        reply: "We're growing! Explore our current job openings at https://www.sudasolutions.com/current-job-openings.html and apply through the careers form: https://www.sudasolutions.com/careers.html#apply"
      },
      {
        match: /contact|email|phone|call|number|location|address|office|visit|talk/i,
        reply: "You can reach us at 0203 597 3519, email info@sudasolutions.com, or visit Office G04, Flexspace Business Centre, Monckton Road, Wakefield WF2 7AS. Full details: https://www.sudasolutions.com/contact.html"
      },
      {
        match: /services|what do you do|your offer|solutions/i,
        reply: "We offer 8 core areas: <b>IT Consulting</b>, <b>Network Setup & Management</b>, <b>Cloud Computing</b>, <b>IT Project Management</b>, <b>Software Application Development</b>, <b>Mobile Device Management</b>, <b>Unified Telecommunications</b> and <b>Digital Marketing</b>. Explore them here: https://www.sudasolutions.com/services.html"
      },
      {
        match: /hello|hi|hey|help|start/i,
        reply: "Hi there! Ask me about our IT consulting, cloud, networking, software development, telecoms, digital marketing services - or how to get a free quote."
      }
    ];

    var fallback = "Thanks for your message! For a quick answer, our team is a call or email away: 0203 597 3519 or info@sudasolutions.com. You can also browse our services at https://www.sudasolutions.com/services.html";

    /* ---------- helpers ---------- */
    function botMsg(html) {
      var m = document.createElement("div");
      m.className = "chat-msg msg-bot";
      m.innerHTML = html;
      bodyEl.appendChild(m);
      scrollChat();
    }
    function userMsg(text) {
      var m = document.createElement("div");
      m.className = "chat-msg msg-user";
      m.textContent = text;
      bodyEl.appendChild(m);
      scrollChat();
    }
    function typing(cb) {
      var t = document.createElement("div");
      t.className = "msg-typing";
      t.innerHTML = "<span></span><span></span><span></span>";
      bodyEl.appendChild(t);
      scrollChat();
      setTimeout(function () {
        bodyEl.removeChild(t);
        cb();
      }, 650);
    }
    function scrollChat() {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }
    function renderQuick() {
      quickEl.innerHTML = "";
      quickReplies.forEach(function (q) {
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = q;
        b.addEventListener("click", function () { ask(q); });
        quickEl.appendChild(b);
      });
    }
    function answer(text) {
      var lower = text.toLowerCase();
      var found = false;
      intents.forEach(function (it) {
        if (!found && it.match.test(lower)) {
          found = true;
          botMsg(it.reply);
        }
      });
      if (!found) setTimeout(function () { botMsg(fallback); }, 500);
    }
    function ask(text) {
      userMsg(text);
      typing(function () { answer(text); });
    }

    /* ---------- open / close ---------- */
    function open() {
      windowEl.classList.add("open");
      launcher.classList.add("open");
      launcher.setAttribute("aria-expanded", "true");
      setTimeout(function () { inputEl.focus(); }, 120);
    }
    function close() {
      windowEl.classList.remove("open");
      launcher.classList.remove("open");
      launcher.setAttribute("aria-expanded", "false");
    }
    launcher.addEventListener("click", function () {
      if (windowEl.classList.contains("open")) close();
      else open();
    });
    $(".chat-close", windowEl).addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    function send() {
      var v = inputEl.value.trim();
      if (!v) return;
      inputEl.value = "";
      ask(v);
    }
    sendEl.addEventListener("click", send);
    inputEl.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });

    /* seed conversation once */
    setTimeout(function () {
      botMsg("Hi! I'm the <b>Suda Solutions assistant</b>. Ask me about our <b>IT services</b>, <b>quotes</b>, <b>careers</b> or how to <b>contact</b> the team. Pick a shortcut below or type your question.");
      renderQuick();
    }, 600);
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = $("#year");
    if (el) el.textContent = new Date().getFullYear();
  }
})();