/* ==========================================================================
   JOSHOS MARINE — SITE SETTINGS
   --------------------------------------------------------------------------
   This is the only file you need to edit to change contact details.
   Save it, refresh the site, and every phone number, email link, hours
   listing and booking form picks up the new values automatically.
   ========================================================================== */

window.JOSHOS = {
  /* --- Contact details ---------------------------------------------------- */

  // `phone` is how the number is displayed, `phoneLink` is the same number
  // in international format for tap-to-call and tap-to-text.
  phone: "0423 417 906",
  phoneLink: "+61423417906",

  // Where booking requests are sent.
  email: "joshosmarine@gmail.com",

  // Where you work, e.g. "Gold Coast & Northern Rivers". Leave "" to hide it.
  area: "",

  // Opening hours, one [label, value] pair per row. Leave [] to hide them.
  hours: [
    ["Mon – Fri", "8am – 5pm"],
    ["Sat – Sun", "Closed"],
  ],

  // The same hours in the short form search engines read. Leave [] to skip.
  hoursForSearch: ["Mo-Fr 08:00-17:00"],

  // Shown in the footer.
  abn: "92 623 093 122",

  // Full profile URLs. Leave "" to hide the icon.
  facebook: "",
  instagram: "",

  /* --- Booking forms ------------------------------------------------------ */

  // Where the forms post to. Requests are emailed to the address in the URL
  // by FormSubmit (formsubmit.co), a free form-to-email service with no
  // account. To send somewhere else, change the address here; the first
  // request after a change triggers a one-off "Activate Form" email to the
  // new address.
  //
  // Formspree works as a drop-in alternative ("https://formspree.io/f/xxxx").
  // If this is "", or the service ever fails, the forms fall back to opening
  // the customer's own email app with the details already written out.
  formEndpoint: "https://formsubmit.co/ajax/joshosmarine@gmail.com",

  // Extra settings sent with each request. For FormSubmit: lay the email out
  // as a table, and skip its captcha page (the form has its own spam trap).
  formExtraFields: { _template: "table", _captcha: "false" },
};
