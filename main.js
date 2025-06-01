const exitBtn = document.getElementById("logout-btn");
exitBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href =
    "https://micael-h.github.io/sistema-seguro-comunicacao/pages/login.html";
});
