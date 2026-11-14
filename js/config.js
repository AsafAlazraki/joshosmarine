/* ==========================================================================
   JOSHOS MARINE — SITE SETTINGS
   --------------------------------------------------------------------------
   This is the only file you need to edit to change contact details.
   Save it, refresh the site, and every phone number, email link, hours
   listing and booking form picks up the new values automatically.
   ========================================================================== */

window.JOSHOS = {
  /* --- Contact details ---------------------------------------------------- */

  // TODO: replace with the real number. `phone` is how it's displayed,
  // `phoneLink` is the same number in international format for tap-to-call.
  phone: "0400 000 000",
  phoneLink: "+61400000000",

  // TODO: replace with the address booking requests should go to.
  email: "bookings@example.com",

  // Where you work, e.g. "Gold Coast & Northern Rivers". Leave "" to hide it.
  area: "",

  // Opening hours, one [label, value] pair per row. Leave [] to hide them.
  hours: [
    ["Bookings", "By appointment"],
  ],

  // Shown in the footer when filled in, e.g. "12 345 678 901".
  abn: "",

  // Full profile URLs. Leave "" to hide the icon.
  facebook: "",
  instagram: "",

  /* --- Booking forms ------------------------------------------------------ */

  // Paste a form endpoint here and booking requests are delivered straight
  // to your inbox without the customer leaving the page. Any service that
  // accepts a JSON POST works, for example:
  //   Formspree  ->  "https://formspree.io/f/xxxxxxxx"
  //   Web3Forms  ->  "https://api.web3forms.com/submit"  (also set formExtraFields)
  //
  // While this is "", the forms fall back to opening the customer's own
  // email app with the booking details already written out.
  formEndpoint: "",

  // Extra fields some form services need, e.g. { access_key: "your-key" }
  // for Web3Forms. Leave {} for Formspree.
  formExtraFields: {},
};
