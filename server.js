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

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});