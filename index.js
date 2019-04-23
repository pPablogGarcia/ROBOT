const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js')
}

async function Start(){
    let search = {}

    await robots.input(search);
    await robots.text(search);

    console.log(search);
}

Start();