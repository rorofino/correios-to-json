var fs = require('fs');
var path = require('path');
var lineReader = require('readline');

var dirname = 'E:\\Correios\\Base de CEPs Out 2017';

function walkSync(dir, filelist) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            filelist.push({ filename: file, path: path.join(dir, file) });
        }
    });
    return filelist;
};

var allFiles = walkSync(dirname);

var regexLocalidade = new RegExp('.*[F-f]ixo.*DNE_(GU|DLT)_LOCALIDADES.*\.txt', 'gi');
var localidadeFiles = allFiles.filter(item => item.path.match(regexLocalidade));
var localidades = [];
localidadeFiles.forEach(item => {
    var lines = fs.readFileSync(item.path, 'latin1').split('\n').filter(Boolean);
    lines.forEach((item, index) => {
        if (index > 0) {
            var localidade = {
                uf: item.substring(3, 5).trim(),
                id: parseInt(item.substring(11, 19).trim(), 10),
                nome: item.substring(19, 91).trim(),
            };
            var ibge = item.substring(154, 161).trim();
            if (ibge)
                localidade.ibge = ibge;
            localidades.push(localidade);
        }
    });
});

fs.writeFile('localidades.json', JSON.stringify(localidades), 'latin1', () => console.log('localidades concluido.'));

var regexLogradouro = new RegExp('.*[F-f]ixo.*DNE_(GU|DLT).*_LOGRADOUROS.*\.txt', 'gi');
var logradouroFiles = allFiles.filter(item => item.path.match(regexLogradouro));
var logradouros = [];
logradouroFiles.forEach(item => {
    var lines = fs.readFileSync(item.path, 'latin1').split('\n').filter(Boolean);
    lines.forEach((item, index) => {
        if (index > 0) {
            logradouros.push({
                localidadeId: parseInt(item.substring(9, 17).trim(), 10),
                bairro: item.substring(102, 174).trim(),
                tipo: item.substring(259, 285).trim(),
                nome: item.substring(374, 446).trim(),
                cep: item.substring(518, 526).trim()
            });
        }
    });
});

fs.writeFile('logradouros.json', JSON.stringify(logradouros), 'latin1', () => console.log('logradouros concluido.'));



