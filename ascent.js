document.querySelectorAll("[data-comparison]").forEach((comparison) => {
  const buttons = comparison.querySelectorAll("[data-view]");
  const before = comparison.querySelector("[data-before]");
  const after = comparison.querySelector("[data-after]");
  const caption = comparison.querySelector("[data-caption]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const showAfter = button.dataset.view === "after";
      before.hidden = showAfter;
      after.hidden = !showAfter;
      caption.textContent = showAfter
        ? "The redesigned workflow leads with readiness, location, and an explicit rehab action."
        : "The existing system contained the right signals, but still asked commanders to synthesize the next action.";

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    });
  });
});

const imageDialog = document.querySelector(".image-dialog");
const dialogImage = imageDialog?.querySelector("img");
const dialogCaption = imageDialog?.querySelector("p");
const dialogClose = imageDialog?.querySelector(".image-dialog-close");

const openImageDialog = (image) => {
  if (!imageDialog || !dialogImage || !dialogCaption) return;
  dialogImage.src = image.currentSrc || image.src;
  dialogImage.alt = image.alt;
  dialogCaption.textContent =
    image.dataset.lightboxCaption ||
    image.closest("figure")?.querySelector("figcaption")?.textContent ||
    image.alt;
  imageDialog.showModal();
};

document.querySelectorAll("main figure img").forEach((image) => {
  image.classList.add("project-image", "expandable");
  image.dataset.expandable = "";
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Expand image: ${image.alt}`);
  image.addEventListener("click", () => openImageDialog(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageDialog(image);
    }
  });
});

dialogClose?.addEventListener("click", () => imageDialog.close());
imageDialog?.addEventListener("click", (event) => {
  if (event.target === imageDialog) imageDialog.close();
});

const heroFigure = document.querySelector(".hero-figure");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (heroFigure && !reducedMotion.matches) {
  heroFigure.addEventListener("pointermove", (event) => {
    const rect = heroFigure.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroFigure.style.setProperty("--hero-rx", `${y * -3.5}deg`);
    heroFigure.style.setProperty("--hero-ry", `${x * 4.5}deg`);
  });
  heroFigure.addEventListener("pointerleave", () => {
    heroFigure.style.setProperty("--hero-rx", "0deg");
    heroFigure.style.setProperty("--hero-ry", "0deg");
  });
}
