const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

const watsonApiKey = require('../credentials/watson-nlu.json').apiKey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');

console.log(watsonApiKey);
let nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    verson: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
});

async function robot(search) {

    await fetchContentFromWikipedia(search);
    sanitizeContent(search);
    breakContentIntoSentences(search);
    LimitMaximumSentences(search);
    await fetchKeywordsOfAllSentences(search);

    async function fetchContentFromWikipedia(search) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(search.term);
        const wikipediaContent = wikipediaResponse.get();

        search.sourceContentOriginal = wikipediaContent.content;
    }

    function sanitizeContent(search) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(search.sourceContentOriginal);
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

        search.sourceContentSanitized = withoutDatesInParentheses;

        function removeBlankLinesAndMarkdown(text) {
            const allLines = text.split('\n');

            const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false;
                }

                return true;
            })

            return withoutBlankLinesAndMarkdown.join(' ');
        }
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, ' ');
    }

    function breakContentIntoSentences(search) {
        search.sentences = [];

        const sentences = sentenceBoundaryDetection.sentences(search.sourceContentSanitized);
        sentences.forEach((sentence) => {
            search.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        });
    }

    function LimitMaximumSentences(search){
        search.sentences = search.sentences.slice(0, search.maximumSentences);
    }

    async function fetchKeywordsOfAllSentences(search){
        for(let sentence of search.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features:{
                    keywords: {}
                }
            }, (error, response) => {
                if(error){throw error;}

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text;
                });

                resolve(keywords);
            });
        });
    }
};

module.exports = robot;
