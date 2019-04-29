const robots = {
    input: require('./robots/input'),
    text: require('./robots/text')
}

function Start(){

    let search = {
        maximumSentences: 10
    }

    robots.input(search);
    robots.text(search);

    console.log(JSON.stringify(search, null, 4));
}

Start();