const express = require("express");
const fs=require ('fs');
const path=require('path');
const sharp=require('sharp');
const sass=require('sass');
const ejs = require('ejs');
const {Client} = require ('pg');
const {randomInt} = require('crypto');

var client = new Client({
    database: "bd_tw_test",
    user:"corina",
    password:"123456",
    host:"localhost",
    port:5432
});
client.connect();
client.query("select * from lab8_12", function(err, rez){
    console.log("Eroare BD",err);
 
    console.log("Rezultat BD",rez.rows);
});
 
obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "resurse/backup"),
    optiuniMeniu:[]
}

client.query("select * from unnest(enum_range(null::tipuri_produse))", function (err,rezCategorie){
    if(err){
        console.log(err);
    }
    else{
        obGlobal.optiuniMeniu=rezCategorie.rows
    }

});

app=express();
 
console.log("Folder proiect:", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());

vectorFoldere=["temp","temp1", "backup"]
for(let folder of vectorFoldere){
    // let caleFolder=__dirname+"/"+folder;
    let caleFolder=path.join(__dirname,folder);
    if(!fs.existsSync(caleFolder))
        fs.mkdirSync(caleFolder);
}

function compileazaScss(caleScss, caleCss) {
    if (!caleCss) {
        // let vectorCale = caleScss.split("\\");
        // let numeFisierExtensie = vectorCale[vectorCale.length - 1];
        let numeFisierExtensie = path.basename(caleScss);
        let numeFisier = numeFisierExtensie.split(".")[0]; // a.scss->[("a"), ("scss")]
        caleCss = numeFisier + ".css";
    }
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss);
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);

    //LA ACEST PUNCT AVEM CAI ABSOLUTE IN CALESCSS SI FOLDER
    // let vectorCale = caleScss.split("\\");
    // let numeFisCss = path.basename(caleCss);
    let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup))
        fs.mkdirSync(caleBackup, {recursive:true});
    
    let numeFisCss = path.basename(caleCss);
    if (fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss));
    }
    rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
    // console.log("Compilare css: ", rez);
}

// compileazaScss("a.scss");

vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere){
    if(path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    // console.log(eveniment, numeFis);
    if(eveniment == "change" || eveniment == "rename"){
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname,"/resurse")));
app.use("/node_modules", express.static(path.join(__dirname,"/node_modules")));

app.use("/*", function(req,res,next){
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu;
    next();
});

app.use(/ \//, function (req,res){
    res.send("Ceva");
    // console.log(req.originalUrl);
    // console.log(req.url);
});

//nu accepta extensie

app.use(/^\/resurse(\/[a-zA-Z0-9]*(?!\.)[a-zA-Z0-9]*)*$/, function (req, res) {
    afiseazaEroare(res, 403);
})

app.get("/favicon.ico", function(req,res){
    res.sendFile(path.join(__dirname,"/resurse/imagini/margareta-1.jpg"))
});

app.get("/ceva", function(req, res){
    // console.log("cale:",req.url)
    res.send("<h1>altceva</h1> ip:"+req.ip);
});

app.get("/oferte", function(req, res){
    res.render("pagini/oferte.ejs");
});

app.get(["/index","/","/home"], function(req, res){
    let nrImagini = randomInt(6, 12);
    if (nrImagini % 2 == 0)
        nrImagini++;

    let imgInv = [...obGlobal.obImagini.imagini].reverse();

    let fisScss = path.join(__dirname, "Resurse/scss/galerie-animata.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split('\n');

    let stringImg = "$nrImg: " + nrImagini + ";";
    liniiFisScss.shift();
    liniiFisScss.unshift(stringImg);
    fs.writeFileSync(fisScss, liniiFisScss.join('\n'))
    res.render("pagini/index.ejs", {ip: req.ip, a: 10,b: 20, imagini: obGlobal.obImagini.imagini, nrImagini: nrImagini, imgInv: imgInv });
});

// app.get(/[a-zA-Z0-9]\.ejs$/)
app.get("/*.ejs", function(req,res){
    afiseazaEroare(res,400);
});

app.get("/*.css", function(req,res){
    afiseazaEroare(res,400);
});

app.get("/produse",function(req, res){

    //TO DO query pentru a selecta toate produsele
    //TO DO se adauaga filtrarea dupa tipul produsului
    //TO DO se selecteaza si toate valorile din enum-ul categ_prajitura
    client.query("select * from unnest(enum_range(null::categ_prajitura))", function (err,rezCategorie){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else{
            let conditieWhere = "";
        if(req.query.tip)
            conditieWhere = ` WHERE tip_produs = '${req.query.tip}' `;
 
        client.query("select * from prajituri"+conditieWhere , function( err, rez){
            if(err){
                console.log(err);
                afiseazaEroare(res, 2);
            }
            else
                res.render("pagini/produse", {produse:rez.rows, optiuni:rezCategorie.rows});
        });

        }
    });
     
});

app.get("/produs/:id",function(req, res){
    console.log(req.params);
    
    client.query(` select * from prajituri where id = ${req.params.id} `, function( err, rezultat){
        if(err){
            console.log(err);
            afiseazaEroare(res, 2);
        }
        else
            res.render("pagini/produs", {prod:rezultat.rows[0]});
    });
});


app.get("/*", function(req, res){
    try{
    res.render("pagini"+req.url, function(err, rezRandare){
        if(err){
            // console.log(err);  
            if(err.message.startsWith("Failed to lookup view"))
                // afiseazaEroare(res,{identificator:404, titlu:"ceva"});
                afiseazaEroare(res,404,"ceva");
            else
                afiseazaEroare(res);  
        }
        else{
            // console.log(rezRandare);
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
    // console.log(continut);
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

function initializeazaImagini(){
    var continut = fs.readFileSync(path.join(__dirname, "/resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleAbs = path.join(__dirname, obGlobal.obImagini.cale_galerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");

    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);

    for (let imag of vImagini) {
        [nume_fisier, extensie] = imag.fisier.split(".");
        imag.fisier_mediu = "/" + path.join(obGlobal.obImagini.cale_galerie, "mediu", nume_fisier + "_mediu" + ".webp");
        let caleAbsFisMediu = path.join(__dirname, imag.fisier_mediu);
        sharp(path.join(caleAbs, imag.fisier)).resize(400).toFile(caleAbsFisMediu);

        imag.fisier = "/" + path.join(obGlobal.obImagini.cale_galerie, imag.fisier);
    }
}
 
initializeazaImagini();


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
            let errDef = obGlobal.obErori.eroare_default;
            res.render("pagini/eroare", { titlu: titlu, text: text, imagine: obGlobal.obErori.cale_baza = "/" + errDef.imagine });

        }
    }
    else {
        let errDef = obGlobal.obErori.eroare_default;
        res.render("pagini/eroare", { titlu: errDef.titlu, text: errDef.text, imagine: errDef.imagine });
    }
}

function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
  }

app.listen(8080);
 
console.log("Serverul a pornit!");