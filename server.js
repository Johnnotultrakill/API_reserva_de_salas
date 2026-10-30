require('dotenv').config()

const express = require('express');
const db = require('./banco');
const { autenticar, apenasAdmin } = require('./middleware/auth');


const porta = 3000;
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/auth', require('./routes/auth'));

app.get('/', (req, res) =>{
    res.send("Reserva de Salas!")
});

app.get('/salas', (req, res) => {
    db.all(
        "Select* from salas",
        [],
        (erro, linhas) =>{
            if (erro) {
                return res.status(500).send("Erro ao consultar salas");
            }
            res.json(linhas);
        } 
    )
});

app.post('/salas', autenticar, apenasAdmin, (req, res) => {
    const { numero_sala, capacidade, recursos, tipo_sala } = req.body;

    const numero = String(numero_sala || "").trim();
    if (!numero) {
        return res.status(400).send("Por favor insira o número da sala");
    }

    const capacidadeNum = Number(capacidade);
    if (!Number.isInteger(capacidadeNum) || capacidadeNum <= 0) {
        return res.status(400).send("A capacidade deve ser um número inteiro maior que zero");
    }

    db.run(
        "INSERT INTO salas (numero_sala, capacidade, recursos, tipo_sala) VALUES (?, ?, ?, ?)",
        [numero, capacidadeNum, recursos, tipo_sala],
        function (erro) {
            if (erro) {
                if (erro.message.includes("UNIQUE")) {
                    return res.status(409).send("Já existe uma sala com esse número");
                }
                return res.status(500).send("Erro ao cadastrar sala");
            }
            res.status(201).json({
                id: this.lastID,
                numero_sala: numero,
                capacidade: capacidadeNum,
                recursos,
                tipo_sala
            });
        }
    );
});

app.get('/salas/:id', (req, res)=>{
    const id = Number(req.params.id);
    db.get("select*from salas where id=?",
        [id],
        (erro, sala) =>{
            if(erro){
                return res.status(500).send("Erro ao consultar sala")
            }
            if(!sala){
                return res.status(404).send("Sala não encontrada")
            }
            res.json(sala)
        }
    )
});

app.patch('/salas/:id', (req, res)=>{
    const { numero_sala, capacidade,
         recursos, tipo_sala} = req.body;
    const id = Number(req.params.id);
    
    
    const campos = [];
    const valores = [];

    if(!Number(req.params.id)){
        return res.status(400).send("ID inválido")
    }
    
    if(numero_sala !== undefined){
        const numero = String(numero_sala).trim();
        if(!numero){
            return res.status(400).send("Coloque um, valor válido");

        }
        campos.push("numero_sala = ?");
        valores.push(numero);
    }

    if(recursos !== undefined){
        campos.push("recursos = ?");
        valores.push(recursos);
    }
    if(tipo_sala !== undefined){
        campos.push("tipo_sala = ?")
        valores.push(tipo_sala);
    }
    if(capacidade !== undefined){
        campos.push("capacidade = ?")
    }
    if(campos.length === 0){
        return res.status(400).send("Envie pelo menos um campo que deseja atualiazar");

    }
    valores.push(id);
    
    db.run(`update salas
            set ${campos.join(",")} where id = ? `,
            valores,

            function(erro){
                  if (erro) {
                    if (erro.message.includes("UNIQUE")) return res.status(409).send("Já existe uma sala com esse número");
                         return res.status(500).send('Erro em atualizar sala');
                    }
                    if (this.changes === 0) return res.status(404).send("Sala não encontrada");
                res.json({
                    mensagem : "sala atualizada com sucesso",

                    
                });


                
            }
        
        
        
        );
    


});

app.delete('/salas/:id', (req, res)=>{
    const id = Number(req.params.id);

    db.get(
        'select count(*) as total from reservas where sala_id = ?',
        [id],
        (erro, resultado)=>{
            if(erro){
                return res.status(500).send("Erro em verificar reservas");
            }
            if (resultado.total > 0){
                return res.status(409).send("Não é possivel deletar essa sala: a sala já possui uma reserva");
            }
            db.run(
    "delete from salas where id =?",
    [id],
    function(erro){
        if(!Number.isInteger(id)){
            return res.status(400).send("Id inválido")
        }
        if(erro){
            return res.status(500).send("Erro ao excluir a sala")

        }
        if(this.changes === 0){
            return res.status(404).send("Sala não encontrada")
        }
        res.json({
            mensagem: ("Sala excluída com sucesso"),
            
        });
    });
})
    

});

app.get('/reservas', autenticar, (req, res) => {
    const { sala_id, data } = req.query;

    const condicoes = [];
    const valores = [];

    if (sala_id !== undefined) {
        const salaId = Number(sala_id);
        if (!Number.isInteger(salaId)) {
            return res.status(400).send("sala_id inválido");
        }
        condicoes.push("reservas.sala_id = ?");
        valores.push(salaId);
    }

    if (data !== undefined) {
        const dia = new Date(`${data}T00:00:00`);
        if (isNaN(dia)) {
            return res.status(400).send("Data inválida. Use o formato 2026-12-10");
        }
        const proximoDia = new Date(dia);
        proximoDia.setDate(proximoDia.getDate() + 1);

        condicoes.push("reservas.inicio < ? AND reservas.fim > ?");
        valores.push(proximoDia.toISOString(), dia.toISOString());
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

    db.all(
        `SELECT reservas.id, reservas.sala_id, salas.numero_sala,
                reservas.usuario_id, usuarios.nome AS usuario,
                reservas.inicio, reservas.fim
         FROM reservas
         JOIN salas ON salas.id = reservas.sala_id
         JOIN usuarios ON usuarios.id = reservas.usuario_id
         ${where}
         ORDER BY reservas.inicio`,
        valores,
        (erro, linhas) => {
            if (erro) {
                return res.status(500).send("Erro ao consultar reservas");
            }
            res.json(linhas);
        }
    );
});

app.delete('/reservas/:id', autenticar, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).send("Id inválido");
    }

    db.get("SELECT * FROM reservas WHERE id = ?", [id], (erroBusca, reserva) => {
        if (erroBusca) {
            return res.status(500).send("Erro ao consultar reserva");
        }
        if (!reserva) {
            return res.status(404).send("Reserva não encontrada");
        }
        if (reserva.usuario_id !== req.usuario.id && req.usuario.perfil !== 'admin') {
            return res.status(403).send("Você só pode cancelar suas próprias reservas");
        }

        db.run("DELETE FROM reservas WHERE id = ?", [id], function (erro) {
            if (erro) {
                return res.status(500).send("Erro ao cancelar reserva");
            }
            res.json({ mensagem: "Reserva cancelada com sucesso", id });
        });
    });
});

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});