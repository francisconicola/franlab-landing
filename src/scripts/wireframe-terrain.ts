const canvas = document.querySelector<HTMLCanvasElement>("#terrain-background");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const color = [110, 231, 183] as const;
  const columns = 24;
  const rows = 16;
  const cellSize = 1.05;
  const cameraHeight = 2.2;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const stars = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.46,
    alpha: 0.25 + Math.random() * 0.55,
  }));

  let terrainOffset = 12;
  let look = 0;
  let targetLook = 0;
  let lastFrame = 0;

  const terrainHeight = (x: number, z: number) =>
    Math.sin(x * 0.42 + z * 0.18) * 1.35 +
    Math.sin(x * 0.19 - z * 0.33) * 0.85 +
    Math.sin(z * 0.51 + x * 0.07) * 0.55;

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  interface Point {
    x: number;
    y: number;
  }

  const project = (
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
  ): Point | null => {
    if (z < 0.7) return null;

    const normalizedX = x / z;
    const normalizedY = y / z;
    if (normalizedX < -2.2 || normalizedX > 2.2) return null;

    const fieldOfView = Math.min(width, height) * 0.86;
    return {
      x: width * 0.5 + normalizedX * fieldOfView,
      y: height * 0.56 - normalizedY * fieldOfView,
    };
  };

  const sample = (
    column: number,
    row: number,
    width: number,
    height: number,
  ) => {
    const x = (column - (columns - 1) * 0.5) * cellSize + look * 1.8;
    const z = 1.7 + row * cellSize;
    const y = terrainHeight(x + look * 5, terrainOffset + z) - cameraHeight;
    return project(x, y, z, width, height);
  };

  const isOnScreen = (
    point: Point | null,
    width: number,
    height: number,
  ): point is Point =>
    point !== null &&
    point.x > -width * 0.2 &&
    point.x < width * 1.2 &&
    point.y > -height * 0.2 &&
    point.y < height * 1.2;

  const strokeSegment = (
    start: Point | null,
    end: Point | null,
    alpha: number,
    lineWidth: number,
    width: number,
    height: number,
  ) => {
    if (!isOnScreen(start, width, height)) return;
    if (!isOnScreen(end, width, height)) return;

    context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };

  const draw = (width: number, height: number) => {
    context.fillStyle = "#0b0c0e";
    context.fillRect(0, 0, width, height);

    for (const star of stars) {
      context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${star.alpha * 0.45})`;
      context.fillRect(star.x * width, star.y * height * 0.52, 1.4, 1.4);
    }

    context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.22)`;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, height * 0.56);
    context.lineTo(width, height * 0.56);
    context.stroke();

    const grid: Array<Array<Point | null>> = [];
    for (let row = 0; row < rows; row += 1) {
      const points: Array<Point | null> = [];
      for (let column = 0; column < columns; column += 1) {
        points.push(sample(column, row, width, height));
      }
      grid.push(points);
    }

    context.lineJoin = "round";
    context.lineCap = "round";

    for (let row = 0; row < rows; row += 1) {
      const nearness = 1 - row / (rows - 1);
      const alpha = 0.18 + nearness * 0.78;
      const lineWidth = 0.7 + nearness * 1.35;

      for (let column = 0; column < columns - 1; column += 1) {
        strokeSegment(
          grid[row][column],
          grid[row][column + 1],
          alpha,
          lineWidth,
          width,
          height,
        );
      }

      if (row < rows - 1) {
        for (let column = 0; column < columns; column += 1) {
          strokeSegment(
            grid[row][column],
            grid[row + 1][column],
            alpha * 0.85,
            lineWidth,
            width,
            height,
          );
        }
      }
    }
  };

  const frame = (time: number) => {
    const delta = Math.min(
      0.05,
      lastFrame ? (time - lastFrame) * 0.001 : 0.016,
    );
    lastFrame = time;

    if (!reducedMotion) {
      terrainOffset += delta * 4.2;
      look += (targetLook - look) * Math.min(1, delta * 6);
    }

    resize();
    draw(canvas.width, canvas.height);

    if (!reducedMotion) requestAnimationFrame(frame);
  };

  window.addEventListener("pointermove", (event) => {
    targetLook = (event.clientX / window.innerWidth - 0.5) * 1.15;
  });
  document.documentElement.addEventListener("pointerleave", () => {
    targetLook = 0;
  });

  if (reducedMotion) {
    resize();
    draw(canvas.width, canvas.height);
  } else {
    requestAnimationFrame(frame);
  }
}
