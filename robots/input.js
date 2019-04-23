const readLine = require('readline-sync');

function robot(search){

    search.term = askAndReturnSearchTerm();
    //search.prefix = askAnReturnPrefix();

    function askAndReturnSearchTerm(){
        return readLine.question('Type a wikipedia search term: ');        
    }

    function askAnReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readLine.keyInSelect(prefixes, 'Choose one option: ');
        const selectedPrefixText = prefixes[selectedPrefixIndex];
        
        return selectedPrefixText;
    }
    return search;
}

module.exports = robot;