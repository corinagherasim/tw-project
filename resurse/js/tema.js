let tema = localStorage.getItem("tema");
if (tema)
    document.body.classList.add(tema);

window.addEventListener("DOMContentLoaded", function () {
    document.getElementById("switch_tema").checked = !document.body.classList.contains("dark");
    document.getElementById("switch_tema").onclick = function () {
        if(document.getElementById("switch_tema").checked){
            if (document.body.classList.contains("dark")) {
                document.body.classList.remove("dark");
                localStorage.removeItem("tema");
            }
        }
        else {
            document.body.classList.add("dark");
            localStorage.setItem("tema", "dark");
        }
    }
});