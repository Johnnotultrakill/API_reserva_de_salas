

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../banco');


const router = express.Router();

router.post('/registro', async(req, res)=>{
    const {nome, email, senha} = req.body;

    const nomeLimpo = String(nome || "").trim();
    const emailLimpo = String(email || "").trim().toLowerCase();


    if (!nomeLimpo || !emailLimpo || !senha) {
        return res.status(400).send("Nome, e-mail e senha são obrigatórios");
    }
    if (String(senha).length < 6) {
        return res.status(400).send("A senha deve ter pelo menos 6 caracteres");
    }


    try {
    const senha_hash = await bcrypt.hash(String(senha), 10);

    db.run(
        "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
        [nomeLimpo, emailLimpo, senha_hash],
        function (erro) {
            if (erro) {
                if (erro.message.includes("UNIQUE")) {
                    return res.status(409).send("E-mail já cadastrado");
                }
                return res.status(500).send("Erro ao cadastrar usuário");
            }
            res.status(201).json({ id: this.lastID, nome: nomeLimpo, email: emailLimpo });
        }
    );
} catch (erro) {
    res.status(500).send("Erro ao cadastrar usuário");
}

});

router.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const emailLimpo = String(email || "").trim().toLowerCase();
    if (!emailLimpo || !senha) {
        return res.status(400).send("Informe e-mail e senha");
    }
    db.get(
        "select * from usuarios where email = ?",
        [emailLimpo],
        async (erro, usuario) => {
            if (erro) {
                console.error("Erro no banco:", erro.message); 
                return res.status(500).send("Erro ao fazer login");
            }
            if (!usuario) {
                return res.status(401).send("E-mail ou senha inválidos");
            }

            try {
                const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha_hash);
                if (!senhaCorreta) {
                    return res.status(401).send("E-mail ou senha inválidos");
                }

                const token = jwt.sign(
                    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
                    process.env.JWT_SECRET,
                    { expiresIn: '2h' }
                );

                res.json({ token });
            } catch (erro) {
                console.error("Erro no login:", erro.message);      
                res.status(500).send("Erro ao fazer login");
            }
        }
    );
});
module.exports = router;