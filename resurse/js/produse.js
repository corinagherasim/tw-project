window.onload = function(){

    document.getElementById("resetare").onclick= function(){
       
        document.getElementById("inp-nume").value="";
       
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
        document.getElementById("inp-categorie").value="toate";
        document.getElementById("i_rad4").checked=true;
        var produse=document.getElementsByClassName("produs");
 
        for (let prod of produse){
            prod.style.display="block";
        }
    }

    document.getElementById("inp-pret").onchange = function(){
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    document.getElementById("filtrare").onclick = function(){
        //inputuri

        let val_nume = document.getElementById("inp-nume").value.toLowerCase();

        let calorii = document.getElementsByName("gr_rad");

        let val_calorii;
        for(let r of calorii){
            if(r.checked){
                val_calorii = r.value;
            }
        }
        if(val_calorii != "toate"){
           [cal_a,cal_b] = val_calorii.split(":");
           var cal_a = parseInt(cal_a);
           var cal_b = parseInt(cal_b);
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_categ = document.getElementById("inp-categorie").value;

        var produse = document.getElementsByClassName("produs");

        for(let prod of produse){
            prod.style.display = "none";

            //valori din produs

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1 = (nume.startsWith(val_nume));

            let prod_calorii = parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML);

            let cond2 = (val_calorii == "toate" || cal_a <= prod_calorii && prod_calorii < cal_b );

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);

            let cond3 = (val_pret <= pret);

            let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;

            let cond4 = (val_categ == "toate" || val_categ == categorie);

         if(cond1 && cond2 && cond3 && cond4)
            prod.style.display="block";
        }
    }

    function sortare(semn){
        var produse = document.getElementsByClassName("produs");
        var v_produse = Array.from(produse);
        v_produse.sort(function(a,b){
            var pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
            var pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
            if (pret_a == pret_b){
                var nume_a =  a.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
                var nume_b =  b.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();
                return semn*nume_a.localeCompare(nume_b);
            }
            return semn*(pret_a - pret_b);
        })

        for(let prod of v_produse){
            prod.parentElement.appendChild(prod);
        }
    }

    document.getElementById("sortCrescNume").onclick = function(){
        sortare(1);
    }

    document.getElementById("sortDescrescNume").onclick = function(){
        sortare(-1);
    }
}