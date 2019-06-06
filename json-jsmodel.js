
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let filePath = "";

rl.question('Please give json file path \n', (answer) => {
    // TODO: Log the answer in a database
    filePath = answer;
    rl.question('Your base function name \n', (answer) => {
        // TODO: Log the answer in a database
        let rawdata = fs.readFileSync(filePath);
        var res = createJSModels(JSON.parse(rawdata), answer);
        WriteResultToFile(res);    
    });
});

function WriteResultToFile(content){
    fs.writeFile('JSFunctions.js',content,function(err){
        if(err){
            console.log(`error occurred while writing file ${err}`);
        }
        else{
            console.log(`File is created.`);
        }
    })
}



function createJSModels(parsedJson, name) {
    if (Array.isArray(parsedJson)) {
        parsedJson = parsedJson[0];
    }
    var result = `function ${toPasacalCase(name)} (args){ \n args=args||{};`;    
    for (var element in parsedJson) {
        var val = parsedJson[element];
        var propName = toPasacalCase(element);
        if (Array.isArray(val) || typeof val === "object") {
            var func = createJSModels(val, propName);
            result = func + "\n" + result;
        }
        var prop = "";
        if (typeof val != "object" || Array.isArray(val)) {
            prop = `this.${element} =args.${element} ||  ${getDefaultValue(val)}`
        }
        else {
            prop = `this.${element} =${getDefaultValue(val, propName)}`
        }
        result = `${result} \n ${prop};`;                
    };

    result = result + "\n }"
    return result;
}

function toPasacalCase(str) {
    return str.replace(new RegExp(/\w/), s => s.toUpperCase());
};

function getDefaultValue(value, name) {
    var result = null;
    switch (typeof value) {
        case "string": {
            result = "''";
            break;
        };
        case "number": {
            result = "0";
            break;
        };
        case "object": {
            if (Array.isArray(value)) {
                result = "[]";
                break;
            }
            result = `new ${name}(args)`;
            break;
        };

    };
    return result;
}