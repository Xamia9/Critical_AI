// Hambuger menu (mobile)
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("open");
    });
  }

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