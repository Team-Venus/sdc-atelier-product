let joinTables = Boolean(process.argv[2]);

await require('./index').run(joinTables);