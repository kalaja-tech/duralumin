/* Shared header + footer, rendered synchronously so there is no flash. */
(() => {
  const page = document.body.dataset.page || "";
  const links = [
    ["windows", "windows.html", "Windows"],
    ["doors", "doors.html", "Doors"],
    ["materials", "materials.html", "Materials"],
    ["projects", "projects.html", "Projects"],
    ["about", "about.html", "About"],
    ["contact", "contact.html", "Contact"],
  ];
  const navLinks = links
    .map(([key, href, label]) => `<a href="${href}"${key === page ? ' class="is-current" aria-current="page"' : ""}>${label}</a>`)
    .join("");

  const header = document.getElementById("site-header");
  if (header) {
    header.outerHTML = `
      <div class="progress" id="progress"></div>
      <header class="nav" id="nav">
        <a href="index.html" class="logo">
          <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="3" width="30" height="34" rx="1"/><path d="M20 3v34"/></svg>
          <span>Duralumin</span>
        </a>
        <nav class="nav__links">${navLinks}</nav>
        <a href="contact.html" class="btn btn--small" data-magnetic><span>Free quote</span></a>
        <button class="burger" id="burger" aria-label="Menu"><span></span><span></span></button>
      </header>
      <div class="mobile-menu" id="mobileMenu">
        <a href="index.html">Home</a>${navLinks}
        <p class="mobile-menu__foot">0800 000 0000 · hello@duralumin.example</p>
      </div>`;
  }

  const footer = document.getElementById("site-footer");
  if (footer) {
    const cta = document.body.dataset.noCta === undefined ? `
      <section class="cta-band">
        <div class="cta-band__inner">
          <p class="eyebrow">Free, no-obligation survey</p>
          <h2 class="reveal-up">Ready when <em>you are.</em></h2>
          <div class="cta-band__actions reveal-up">
            <a href="contact.html" class="btn btn--light" data-magnetic><span>Book a survey</span><i>→</i></a>
            <a href="tel:08000000000" class="btn btn--ghost-light"><span>0800 000 0000</span></a>
          </div>
        </div>
      </section>` : "";
    footer.outerHTML = `${cta}
      <footer class="footer">
        <div class="footer__cols">
          <div class="footer__brand">
            <a href="index.html" class="logo logo--light">
              <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="3" width="30" height="34" rx="1"/><path d="M20 3v34"/></svg>
              <span>Duralumin</span>
            </a>
            <p>Windows, doors and glazing — designed, made and fitted by one family-run team since 1998.</p>
            <form class="newsletter" onsubmit="event.preventDefault(); this.classList.add('done');">
              <input type="email" placeholder="Email for design ideas" aria-label="Email" required />
              <button aria-label="Subscribe">→</button>
              <span class="newsletter__ok">Thanks — you're on the list.</span>
            </form>
          </div>
          <div><h4>Windows</h4><a href="windows.html#types">Casement</a><a href="windows.html#types">Tilt &amp; turn</a><a href="windows.html#types">Sliding sash</a><a href="windows.html#types">Steel-look</a><a href="windows.html#glass">Glazing options</a></div>
          <div><h4>Doors</h4><a href="doors.html#types">Front doors</a><a href="doors.html#types">French doors</a><a href="doors.html#types">Sliding doors</a><a href="doors.html#types">Bi-fold doors</a><a href="doors.html#designer">Door designer</a></div>
          <div><h4>Company</h4><a href="about.html">Our story</a><a href="projects.html">Projects</a><a href="materials.html">Materials</a><a href="about.html#team">Team</a><a href="contact.html#faq">FAQs</a></div>
          <div><h4>Visit</h4><p>Unit 4, Foundry Lane<br />Leeds LS1 0AA</p><p>Mon–Fri 8–6<br />Sat 9–4</p><a href="tel:08000000000">0800 000 0000</a></div>
        </div>
        <div class="footer__big" aria-hidden="true">Duralumin</div>
        <div class="footer__row">
          <span>© ${new Date().getFullYear()} Duralumin Ltd. All rights reserved.</span>
          <span>FENSA · PAS 24 · Which? Trusted Trader</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>`;
  }
})();
