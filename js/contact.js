
/* VORIX CONTACT FORM
   This static form validates input and opens the visitor's email app.
   It does not send or store messages on a server.
*/

(() => {
  "use strict";

  // Replace this with your real VORIX contact email when ready.
  const CONTACT_EMAIL = "";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    const emailLink = document.getElementById("contact-email-link");

    if (emailLink) {
      if (CONTACT_EMAIL) {
        emailLink.href = `mailto:${CONTACT_EMAIL}`;
        emailLink.textContent = CONTACT_EMAIL;
      } else {
        emailLink.removeAttribute("href");
        emailLink.textContent = "Email address coming soon";
      }
    }

    if (!form || !status) return;

    form.addEventListener("submit", event => {
      event.preventDefault();
      status.textContent = "";

      if (!form.reportValidity()) return;

      if (!CONTACT_EMAIL) {
        status.textContent =
          "The contact email has not been configured yet. Please try again later.";
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const topic = String(data.get("topic") || "General enquiry");
      const message = String(data.get("message") || "").trim();

      if (!name || !email || !message) {
        status.textContent = "Please complete all required fields.";
        return;
      }

      const subject = encodeURIComponent(`VORIX enquiry: ${topic}`);
      const body = encodeURIComponent(
        `Name: ${name}\nReply email: ${email}\nTopic: ${topic}\n\n${message}`
      );

      status.textContent =
        "Your email app should open with a prepared draft. The message has not been sent by VORIX.";

      window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    });
  });
})();
