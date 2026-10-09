import fs from 'fs';
const reportsFile = fs.readFileSync('src/routes/app/reports.tsx', 'utf-8');
console.log(reportsFile.includes('autoTable'));
