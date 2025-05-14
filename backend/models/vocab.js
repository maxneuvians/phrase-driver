const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function getCategories() {
    const dataDir = path.join(__dirname, '../data');
    return fs.readdirSync(dataDir)
        .filter(f => f.endsWith('.csv'))
        .map(f => f.replace('.csv', ''));
}

function getWords(category) {
    const filePath = path.join(__dirname, '../data', `${category}.csv`);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const records = parse(content, { columns: true, skip_empty_lines: true });
    return records;
}

module.exports = { getCategories, getWords };
