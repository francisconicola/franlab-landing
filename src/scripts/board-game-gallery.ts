document
  .querySelectorAll<HTMLDialogElement>("[data-gallery-dialog]")
  .forEach((dialog) => {
    const trigger = document.querySelector<HTMLButtonElement>(
      `[aria-controls="${dialog.id}"]`,
    );
    const image = dialog.querySelector<HTMLImageElement>(
      "[data-gallery-image]",
    );
    const caption = dialog.querySelector<HTMLElement>(
      "[data-gallery-caption]",
    );
    const thumbnails = Array.from(
      dialog.querySelectorAll<HTMLButtonElement>("[data-gallery-thumbnail]"),
    );
    const previous = dialog.querySelector<HTMLButtonElement>(
      "[data-gallery-previous]",
    );
    const next = dialog.querySelector<HTMLButtonElement>(
      "[data-gallery-next]",
    );
    const close = dialog.querySelector<HTMLButtonElement>(
      "[data-gallery-close]",
    );
    let currentIndex = 0;

    const showImage = (index: number) => {
      if (!image || !caption || thumbnails.length === 0) return;

      currentIndex = (index + thumbnails.length) % thumbnails.length;
      const thumbnail = thumbnails[currentIndex];
      const url = thumbnail.dataset.imageUrl;
      const description = thumbnail.dataset.imageDescription;

      if (!url || !description) return;

      image.src = url;
      image.alt = description;
      caption.textContent = description;

      thumbnails.forEach((item, itemIndex) => {
        item.setAttribute(
          "aria-current",
          itemIndex === currentIndex ? "true" : "false",
        );
      });
    };

    trigger?.addEventListener("click", () => {
      showImage(0);
      dialog.showModal();
    });

    previous?.addEventListener("click", () => showImage(currentIndex - 1));
    next?.addEventListener("click", () => showImage(currentIndex + 1));
    close?.addEventListener("click", () => dialog.close());

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => showImage(index));
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
    });
  });
