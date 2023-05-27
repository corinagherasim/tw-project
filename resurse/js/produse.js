window.addEventListener("load", function(){

    document.getElementById("resetare").onclick= function(){
       
        document.getElementById("inp-nume").value="";
       
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
        document.getElementById("inp-tip_flori").value="toate";
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

        let numar_fire = document.getElementsByName("gr_rad");

        let val_numar_fire;
        for(let r of numar_fire){
            if(r.checked){
                val_numar_fire = r.value;
            }
        }
        if(val_numar_fire != "toate"){
           [nr_a,nr_b] = val_numar_fire.split(":");
           var nr_a = parseInt(nr_a);
           var nr_b = parseInt(nr_b);
        }

        let val_pret = document.getElementById("inp-pret").value;

        let val_tip_flori = document.getElementById("inp-tip_flori").value;

        var produse = document.getElementsByClassName("produs");

        for(let prod of produse){
            prod.style.display = "none";

            //valori din produs

            let nume = prod.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase();

            let cond1 = (nume.startsWith(val_nume));

            let numar_fire = parseInt(prod.getElementsByClassName("val-numar_fire")[0].innerHTML);

            let cond2 = (val_numar_fire == "toate" || nr_a <= numar_fire && numar_fire < nr_b );

            let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);

            let cond3 = (val_pret <= pret);

            let tip_flori = prod.getElementsByClassName("val-tip_flori")[0].innerHTML;

            let cond4 = (val_tip_flori == "toate" || val_tip_flori == tip_flori);

            // cond1 && cond2 && cond3 && cond4
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

    window.onkeydown = function(e){
        if(e.key == "c" && e.altKey){
            console.log("aici");
            if(document.getElementById("info-suma"))
                return;
            var produse = document.getElementsByClassName("produs");
            let suma = 0;
            for(let prod of produse){
                if(prod.style.display != "none"){
                    let pret = parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
                    suma+=pret;
                }
            }
            let p =document.createElement("p");
            p.innerHTML = suma;
            p.id = "info-suma";
            ps = document.getElementById("p-suma");
            container = ps.parentNode;
            frate = ps.nextElementSibling;
            container.insertBefore(p,frate);
            setTimeout(function(){
                let info = document.getElementById("info-suma");
                if(info)
                    info.remove();
            },1000);
        }
    }

});