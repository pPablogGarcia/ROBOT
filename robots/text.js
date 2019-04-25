const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(search) {

    await fetchContentFromWikipedia(search)
    sanitizeContent(search)
    breakContentIntoSentences(search)

    async function fetchContentFromWikipedia(search) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(search.term);
        const wikipediaContent = wikipediaResponse.get();

        search.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(search) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(search.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

        search.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n')

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }

                return true
            })

            return withoutBlankLinesAndMarkdown.join(' ')
        }
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ')
    }

    function breakContentIntoSentences(search) {
        search.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(search.sourceContentSanitized)
        sentences.forEach((sentence) => {
            search.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })

        console.log(search);
    }
};

module.exports = robot;
