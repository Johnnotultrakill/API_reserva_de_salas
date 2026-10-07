const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database ('./salas.db', (erro) =>{
    if(erro){
        console.error("Erro ao conectar ao banco", erro.message);
        process.exit(1) }
    else{
        console.log("Banco conectado com sucesso");
    } 

    function aoCriarTabela(nome) {
    return (erro) => {
        if (erro) {
            console.error(`Erro ao criar a tabela ${nome}:`, erro.message);
            process.exit(1),
            aoCriarTabela("salas")
        }
    };
}

   db.serialize(()=>{
    db.run("pragma foreign_keys = on");

     db.run(`
        create table if not exists salas(
        id integer primary key autoincrement,
        numero_sala text not null unique,
        capacidade integer not null check (capacidade > 0),
        recursos text,
        tipo_sala text,
        ativa integer not null default 1)`),
         aoCriarTabela("salas");

    db.run(`
        create table if not exists usuarios(
        id integer primary key autoincrement,
        nome text not null,
        email text not null unique,
        senha_hash text not null,
        perfil text not null default 'comum')`,
         aoCriarTabela("salas")
    );
    db.run(`create table if not exists reservas(
        id integer primary key autoincrement,
        sala_id integer not null,
        usuario_id integer not null,
        inicio text not null,
        fim text not null,
        foreign key (sala_id) references salas(id),
        foreign key (usuario_id) references usuarios(id))`,
     aoCriarTabela("salas"))
   })
});

module.exports = db;