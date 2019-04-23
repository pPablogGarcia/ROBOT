const request = require('request');
const sentenceBoundaryDetection = require('sbd');

function robot(search) {

    let query = `${search.term}`;
    let url = `https://pt.wikipedia.org/w/api.php?action=opensearch&search="${query}"&format=json`;
    let contentUrl = `https://pt.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${query}`;

    request(contentUrl, function (err, response, body) {
        if (err) {
            let error = 'Cannot connect to the server';
            console.log(error);
        } else {

            let wiki = JSON.parse(body);

            let page = wiki.query.pages;
            let pageId = Object.keys(wiki.query.pages)[0];
            let content = page[pageId].revisions[0]['*'];

            SanitizeContent(content);
            BreakContentIntoSequences(search);
            console.log(search);
        }
    });

    function SanitizeContent(content) {
        const withoutBlankLinesAndMarkdow = RemoveBlankLinesAndMarkdown(content);
        const withoutDatesParebthesis = RemoveDateParenthesis(withoutBlankLinesAndMarkdow);

        search.sourceContentSanitize = withoutDatesParebthesis;
        function RemoveBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n');

            const notBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                } else {
                    return true;
                }
            })

            return notBlankLinesAndMarkdown.join(' ');
        }

        function RemoveDateParenthesis(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
        }

    }

    function BreakContentIntoSequences(content) {
        search.sentences = [];

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitize);
        sentences.forEach( sentence => {
            search.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            });
        });
    }

    return search
}

module.exports = robot;