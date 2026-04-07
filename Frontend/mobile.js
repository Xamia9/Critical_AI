/**
 * Mobile Navigation Toggle
 * Handles hamburger menu functionality across all pages
 */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation(); // tránh trigger document click
      mobileMenu.classList.toggle("open");
    });
  }

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      hamburger &&
      mobileMenu &&
      mobileMenu.classList.contains("open")
    ) {
      if (
        !hamburger.contains(event.target) &&
        !mobileMenu.contains(event.target)
      ) {
        mobileMenu.classList.remove("open");
      }
    }
  });
});