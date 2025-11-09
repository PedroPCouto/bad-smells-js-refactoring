class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  userRoleFilters = {
    ADMIN: () => true,
    USER: (item) => item.value <= 500,
  };

  staticContent = {
    CSV: {
      header: () => 'ID,NOME,VALOR,USUARIO\n',
      footer: (total) => `\nTotal,,\n${total},,\n`
    },
    HTML: {
      header: (user) => `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>
`,
      footer: (total) => `</table>
<h3>Total: ${total}</h3>
</body></html>
`
    }
  };

  // Define handlers first (arrow functions bind 'this')
  csvContentHandler = (user, item) => {
    if (this.userRoleFilters[user.role](item)) {
      return {
        content: `${item.id},${item.name},${item.value},${user.name}\n`,
        incrementedValue: item.value
      };
    }
    return { content: '', incrementedValue: 0 };
  };

  htmlContentHandler = (user, item) => {
    if (this.userRoleFilters[user.role](item)) {
      item.priority = item.value > 1000;
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return {
        content: `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`,
        incrementedValue: item.value
      };
    }
    return { content: '', incrementedValue: 0 };
  };

  // Now safely reference them
  reportTypeContentHandlers = {
    CSV: this.csvContentHandler,
    HTML: this.htmlContentHandler,
  };

  generateReport(reportType, user, items) {
    const handler = this.reportTypeContentHandlers[reportType];
    const headerFn = this.staticContent[reportType]?.header;
    const footerFn = this.staticContent[reportType]?.footer;

    let report = '';
    let total = 0;
    report += headerFn(user);
    for (const item of items) {
      const { content, incrementedValue } = handler(user, item);
      report += content;
      total += incrementedValue;
    }
    report += footerFn(total);
    return report.trim();
  }
}

module.exports = { ReportGenerator };