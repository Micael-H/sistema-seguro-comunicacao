const exitBtn = document.getElementById("logout-btn");
exitBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/front-end/pages/login.html";
});
