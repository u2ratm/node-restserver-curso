const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario')
const Producto = require('../models/producto')

const fs = require('fs')
const path = require('path')

app.use(fileUpload())

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo
    let id = req.params.id

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se a seleccionado archivos'
                }
            })
    }

    let tiposValidos = ['producto', 'usuario']

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos admitidos son: ' + tiposValidos.join(', ')
            }
        })
    }

    let archivo = req.files.archivo
    let nombreCorto = archivo.name.split('.')
    let extension = nombreCorto[nombreCorto.length - 1]
        //extenciones validas

    let extencionesValidas = ['png', 'jpg', 'gif', 'jpeg']

    if (extencionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'La extenciones admitidas son: ' + extencionesValidas.join(', ')
            }
        })
    }

    let nombreArchivo = `${id}-${ new Date().getMilliseconds ()}.${extension}`



    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {

        if (err)
            return res.status(500).json({
                ok: false,
                err
            })

        if (tipo === 'usuario') {
            imagenUsuario(id, res, nombreArchivo)
        } else {
            imagenProducto(id, res, nombreArchivo)
        }

    })
})

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuario')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuario')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existente'
                }
            })
        }

        borrarArchivo(usuarioDB.img, 'usuario')

        usuarioDB.img = nombreArchivo

        usuarioDB.save((err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'producto')
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'producto')

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existente'
                }
            })
        }

        borrarArchivo(productoDB.img, 'producto')

        productoDB.img = nombreArchivo

        productoDB.save((err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        })
    })

}

function borrarArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/usuario/${nombreImagen}`)
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

module.exports = app