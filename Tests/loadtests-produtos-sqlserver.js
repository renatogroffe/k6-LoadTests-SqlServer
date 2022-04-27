// Extensao do k6 para SQL Server:
// https://github.com/grafana/xk6-sql
// https://k6.io/blog/load-testing-sql-databases-with-k6/

// Documentacao sobre a function randomIntBetween(min, max)
// https://k6.io/docs/javascript-api/jslib/utils/randomintbetween/

import sql from 'k6/x/sql';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = {
    iterations: 3000,
    vus: 10
};

const db = sql.open("sqlserver", "#{CONNECTION_STRING}#");

export function teardown() {
  console.log('Fechando a conexao com o SQL Server...');
  db.close();
}

export default function () {
    const idProduto = randomIntBetween(1, 25000);
    //console.log(`Testes com o produto ${idProduto}`);

    const results = sql.query(db, `SELECT * FROM dbo.Produtos WHERE Id = ${idProduto};`);

    check(results, {
        'Produto encontrado': (r) => r.length === 1,
    });
  
    results.forEach(row => {
        const codigo  = row['Codigo'];
        //console.log(`Encontrou o produto ${row['Id']} - Codigo = ${codigo}`);

        const resultsByCodigo = sql.query(db, `SELECT * FROM dbo.Produtos WHERE Codigo = '${codigo}';`);
        check(resultsByCodigo, {
            'Consulta via Codigo': (r) => r.length === 1,
        });    
    });
}

export function handleSummary(data) {
    return {
      "sqlserver-loadtests.html": htmlReport(data),
      stdout: textSummary(data, { indent: " ", enableColors: true })
    };
}