const Table = require('cli-table3');
const pc = require('picocolors');

function printReport(report) {
    console.log(`\n${pc.bgCyan(pc.black(' CDD SECURITY REPORT '))} ${pc.bold(report.name)} on ${pc.yellow(report.target)}`);
    console.log(pc.gray(`Engine: v${report.engine_version || 'unknown'} | Scope: ${report.scope}\n`));

    const table = new Table({
        head: [pc.gray('Step'), pc.gray('Action'), pc.gray('Status'), pc.gray('Message')],
        colWidths: [25, 15, 12, 40],
        wordWrap: true
    });

    report.steps.forEach(step => {
        step.results.forEach((res, index) => {
            const statusColor = res.status === 'SUCCESS' ? pc.green : pc.red;
            table.push([
                index === 0 ? pc.white(pc.bold(step.title)) : '',
                pc.gray(res.kind),
                statusColor(res.status),
                pc.white(res.message)
            ]);
        });
    });

    console.log(table.toString());
}

function printError(err) {
    console.log(`\n${pc.bgRed(pc.white(' ENGINE ERROR '))} ${pc.red(err.code)}`);
    console.log(`${pc.red('│')} ${pc.white(err.message)}\n`);
}

module.exports = { printReport, printError };