const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization; 

    if (!cabecalho || !cabecalho.startsWith('Bearer ')) {
        return res.status(401).send("Faça login para continuar");
    }

    const token = cabecalho.split(' ')[1];

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (erro) {
        return res.status(401).send("Token inválido ou expirado");
    }
}



function apenasAdmin(req, res, next) {
    if (req.usuario.perfil !== 'admin') {
        return res.status(403).send("Acesso restrito a administradores");
    }
    next();
}

module.exports = { autenticar, apenasAdmin };