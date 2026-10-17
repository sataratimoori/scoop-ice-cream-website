/* SCOOP — contact form validation */
(function () {
  "use strict";

  const contactForm = document.getElementById("contactForm");
  const formFeedback = document.getElementById("formFeedback");
  if (!contactForm) return;

  const fields = contactForm.querySelectorAll("input, select, textarea");

  function validateField(field) {
    const error = field.parentElement.querySelector(".field-error");
    error.textContent = "";
    field.style.borderColor = "";
    field.removeAttribute("aria-invalid");

    // trim so "   " does not count as a real value
    if (field.type === "text" || field.tagName === "TEXTAREA")
      field.value = field.value.replace(/^\s+/, "");

    if (field.checkValidity() && !(field.required && !field.value.trim()))
      return true;

    field.style.borderColor = "#d93f65";
    field.setAttribute("aria-invalid", "true");
    if (field.validity.valueMissing || !field.value.trim())
      error.textContent = "Please fill in this field.";
    else if (field.validity.typeMismatch)
      error.textContent = "Please enter a valid email address.";
    else if (field.validity.tooShort)
      error.textContent = `Please enter at least ${field.minLength} characters.`;
    return false;
  }

  /* Live feedback once a field has been touched */
  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;
    let firstInvalid = null;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!isValid) {
      formFeedback.textContent =
        "Please check the highlighted fields and try again.";
      formFeedback.style.color = "#d93f65";
      firstInvalid.focus();
      return;
    }

    formFeedback.textContent =
      "Thank you! Your message looks great. (This demo form doesn't send email until it is connected to a backend.) 💌";
    formFeedback.style.color = "#23865d";
    contactForm.reset();
  });
})();
