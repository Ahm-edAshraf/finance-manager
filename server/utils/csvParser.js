const fs = require('fs');
const { parse } = require('csv-parse');

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(filePath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }))
            .on('data', (data) => {
                results.push({
                    date: new Date(data.date),
                    amount: parseFloat(data.amount),
                    description: data.description,
                    category: categorizeExpense(data.description)
                });
            })
            .on('end', () => {
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
                resolve(results);
            })
            .on('error', reject);
    });
};

const categorizeExpense = (description) => {
    description = description.toLowerCase();
    
    const categories = {
        food: ['restaurant', 'cafe', 'grocery', 'food', 'meal'],
        transportation: ['uber', 'lyft', 'taxi', 'bus', 'train', 'gas', 'fuel'],
        entertainment: ['movie', 'theatre', 'concert', 'netflix', 'spotify'],
        shopping: ['amazon', 'walmart', 'target', 'store'],
        utilities: ['electricity', 'water', 'gas', 'internet', 'phone'],
        healthcare: ['doctor', 'hospital', 'pharmacy', 'medical'],
        education: ['school', 'university', 'course', 'book'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => description.includes(keyword))) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }
    }

    return 'Other';
};

module.exports = { parseCSV, categorizeExpense };
