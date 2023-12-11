//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');
var cors = require("cors");
var corsOptions = {origin:"*",optionSucessStatus:200};


var app     = express();
app.use(cors(corsOptions));

var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================
app.get("/otraCosa/:id/:algo",(req,res,next)=>{
    console.log("id",req.params.id)
    console.log("algo",req.params.algo)
    utils.query("select * from Devices where id="+req.params.id,(err,rsp,fields)=>{
        if(err==null){
            
            console.log("rsp",rsp);
            res.status(200).send(JSON.stringify(rsp));
        }else{
            console.log("err",err);
            res.status(409).send(err);
        }
        
        //console.log(fields);
    });
    
});

app.put("/devices/state",(req,res,next)=>{
    const body = req.body
    utils.query(`update Devices set state = ${body.state} where id = ${body.id}`,(err,rsp,fields)=>{
        if(err==null){
            console.log("rsp",rsp)
            res.status(200).send({ estado: true, mensaje: "Se actualizó el estado del dispositivo.."})
        }else{
            console.log("err",err)
            res.status(409).send({ estado: false, mensaje: "No se pudo actualizar el estado del dispositivo. Error interno del servidor.", error: err })
        }
        console.log(fields)
    }) 
})

app.put("/devices/value",(req,res,next)=>{
    const body = req.body
    utils.query(`update Devices set value = ${body.value} where id = ${body.id}`,(err,rsp,fields)=>{
        if(err==null){
            console.log("rsp",rsp)
            res.status(200).send({ estado: true, mensaje: "Se actualizó el valor del dispositivo.."})
        }else{
            console.log("err",err)
            res.status(409).send({ estado: false, mensaje: "No se pudo actualizar el valor del dispositivo. Error interno del servidor.", error: err })
        }
        console.log(fields)
    }) 
})

app.post("/devices",(req,res,next)=>{
    const body = req.body
    let defaultValue = null
    if(body.tipoDispositivo == "1") {
        defaultValue = 0.5
    } 
    utils.query(`insert into Devices (name, description, state, type, iconId, value) values 
    ("${body.nombre}", "${body.descripcion}", 1, ${body.tipoDispositivo}, ${body.icono}, ${defaultValue})`,(err,rsp,fields)=>{
        if(err==null){
            console.log("rsp",rsp)
            res.status(200).send({ estado: true, mensaje: "Se guardó correctamente el dispositivo."})
        }else{
            console.log("err",err)
            res.status(409).send({ estado: false, mensaje: "No se pudo crear el dispositivo. Error interno del servidor.", error: err })
        }
        console.log(fields)
    })
})


app.get('/devices/', function(req, res, next) {
    utils.query(`select d.id, d.name, d.description, d.state, 
        d.type, i.icon, d.value    
        from Devices d inner join Icons i on d.iconId = i.id`,(err,rsp,fields)=>{
        if(err==null){
            
            console.log("rspsssssssssss",rsp);
            res.status(200).send(JSON.stringify(rsp));
        }else{
            console.log("err",err);
            res.status(409).send(err);
        }
    });    
});

app.get('/icons/', function(req, res, next) {
    console.log('gaaa')
    utils.query(`select * from Icons`,(err,rsp,fields)=>{
        if(err==null){            
            console.log("rspsssssssssss",rsp);
            res.status(200).send(JSON.stringify(rsp));
        }else{
            console.log("err",err);
            res.status(409).send(err);
        }
    });  
})

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
