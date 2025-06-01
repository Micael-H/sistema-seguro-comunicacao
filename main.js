const exitBtn = document.getElementById("logout-btn");
exitBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/pages/login.html";
});
