const express = require("express");
const fs=require ('fs');
const path=require('path');

obGlobal={
    obErori:null,
    obImagini:null
}
 
app=express();
 
console.log("Folder proiect:", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1"]
for(let folder of vectorFoldere){
    // let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname,folder);
    if(!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname,"/resurse")));
app.use(/ \//, function (req,res){
    res.send("Ceva");
    console.log(req.originalUrl);
    console.log(req.url);
});

//nu accepta extensie

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
})

app.get("/favicon.ico", function(req,res){
    res.sendFile(path.join(__dirname,"/resurse/imagini/margareta-1.jpg"))
});

app.get("/ceva", function(req, res){
    console.log("cale:",req.url)
    res.send("<h1>altceva</h1> ip:"+req.ip);
});

app.get("/oferte", function(req, res){
    res.render("pagini/oferte.ejs");
});

app.get(["/index","/","/home"], function(req, res){
    res.render("pagini/index.ejs", {ip: req.ip, a: 10,b: 20});
});

// app.get(/[a-zA-Z0-9]\.ejs$/)
app.get("/*.ejs", function(req,res){
    afiseazaEroare(res,400);
});

app.get("/*", function(req, res){
    try{
    res.render("pagini"+req.url, function(err, rezRandare){
        if(err){
            console.log(err);  
            if(err.message.startsWith("Failed to lookup view"))
                // afiseazaEroare(res,{identificator:404, titlu:"ceva"});
                afiseazaEroare(res,404,"ceva");
            else
                afiseazaEroare(res);  
        }
        else{
            console.log(rezRandare);
            res.send(rezRandare);
        }    
    });
    }catch(err){
        if(err.message.startsWith("Cannot find module")){
            afiseazaEroare(res,404);
        }
    }
});

function initializeazaErori(){
    var continut=fs.readFileSync(path.join(__dirname,"/resurse/json/eroare.json")).toString("utf-8");
    console.log(continut);
    obGlobal.obErori=JSON.parse(continut);
    let vErori=obGlobal.obErori.info_erori;
    // for(let i=0;i<vErori.lenght;i++){
    //     console.log(vErori[i].imagine);
    // }
    for (let eroare of vErori){
        eroare.imagine="/"+obGlobal.obErori.cale_baza+"/"+eroare.imagine;
    }
}
 
initializeazaErori();


function afiseazaEroare(res, _identificator, _titlu = "titlu default", _text, _imagine){
    let vErori = obGlobal.obErori.info_erori;
    let eroare = vErori.find(function (element) {
        return element.identificator === _identificator;
    });
    if (eroare) {
        let titlu = _titlu == "titlu default" ? (eroare.titlu || _titlu) : _titlu;
        let text = _text || eroare.text;
        let imagine = _imagine || eroare.imagine;
        if (eroare.status) {
            res.status(eroare.identificator).render("pagini/eroare", { titlu: titlu, text: text, imagine: imagine });
        } else {
            res.render("pagini/eroare", { titlu: titlu, text: text, imagine: obGlobal.obErori.cale_baza = "/" + errDef.imagine });

        }
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", { titlu: errDef.titlu, text: errDef.text, imagine: errDef.imagine });
    }
}

app.listen(8080);
 
console.log("Serverul a pornit!");