const inscrever = require("../../controllers/comandos").inscrever
const gify = require('gify')

const { execFile } = require('child_process');
const gifsicle = require('gifsicle');

var sizeOf = require('image-size');

let tipos_permitidos = [
    'image',
    'video'
]

async function run(comando, message, client){
    if(tipos_permitidos.includes(message.type)){
        await figurinha(message, client)
        return
    }
    throw({'message':'Você esqueceu da imagem!'})
}

async function figurinha(message, client){
    if(message.duration<=7){
        try{
            if(message.quotedMsg){
                if(message.quotedMsg.type === 'image'){
                    replySendImageSticker(client,message)
                }
            }else if(message.type == 'video'){
                const base = await client.downloadMedia(message)
                await converterBase64(base, "copy.mp4")
                var opts = {
                    height: 300,
                    rate: 10
                  };
                gify('./assets/images/copy.mp4', './assets/images/copy.gif',opts,function(err){
                    if (err) throw err;
                    var dimensions = sizeOf('./assets/images/copy.gif')
                    let crop = (dimensions.width - dimensions.height) / 2
                    if(dimensions.width < dimensions.height){
                        execFile(gifsicle, ['--crop', `0,${parseInt(crop*-1)}+${dimensions.width}x${dimensions.width}`, '-o', './assets/images/resize.gif', './assets/images/copy.gif'], err => {
                            client.sendImageAsStickerGif(message.from, "./assets/images/resize.gif")
                            console.log(`[${message.sender.id}] Figurinha criada`)
                            PedirPix(client, message)
                        });
                    }else{
                        execFile(gifsicle, ['--crop', `${parseInt(crop)},0+${dimensions.height}x${dimensions.height}`, '-o', './assets/images/resize.gif', './assets/images/copy.gif'], err => {
                            client.sendImageAsStickerGif(message.from, "./assets/images/resize.gif")
                            console.log(`[${message.sender.id}] Figurinha criada`)
                            PedirPix(client, message)
                          });
                    }
                })
            }
            else{
                const base = await client.downloadMedia(message)
                await converterBase64(base, "copy.png")
                await client.sendImageAsSticker(message.from, "./assets/images/copy.png")
                console.log(`[${message.sender.id}] Figurinha criada`)
                PedirPix(client, message)
            }
        }catch(e){
            console.log("Error ao criar figurinha: ", e)
        }
    }else{
        enviarResposta(`${message.sender.pushname}, eu so consigo criar figurinhas de videos com menos de 8 segundos! 😝`, client, message)
    }
}

async function replySendImageSticker (client, message) {
    try {
        const base = await client.downloadMedia(message.quotedMsgObj.id)
        converterBase64(base, "copy.png")
        await client.sendImageAsSticker(message.from, "./assets/images/copy.png")
        console.log(`[${message.sender.id}] Figurinha criada por reply`)
        PedirPix(client, message)

    } catch (e) {
        console.log("Error:", e)
    }
}

async function converterBase64(base, file_name) {
    let formated_base = base.split(",")[1]
    const fs = require('fs')
    fs.writeFileSync(`./assets/images/${file_name}`, formated_base, { encoding: 'base64' })
}

async function enviarResposta(text, client, message) {
    try {
        await client.reply(message.from, `${text}`, message.id)
    } catch (e) {
        console.log(e)
    }
}

function PedirPix(client, message){
    let probabilidade = Math.floor(Math.random() * (30 - 1 + 1)) + 1;

    if(probabilidade == 1){
        client.sendImageAsStickerGif(message.from, './assets/emojis/pixEmoji.gif')
        enviarResposta("Aqui está sua Figurinha " + message.sender.pushname + ", não se esqueça de apoiar o meu desenvolvimento doando qualquer valor no PIX EMAIL: marcelo.apdassis@gmail.com", client, message)
    }
}

inscrever("#figurinha", run)
