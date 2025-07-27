if ("serviceWorker" in navigator) {
  try {
    navigator.serviceWorker.register("https://www.avocodos-web.vercel.app/sw.js");
  } catch (error) {
    console.error("Service worker registration failed:", error);
  }
}
