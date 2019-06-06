const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let filePath = "";
ReadInputs();
function ReadInputs() {
    rl.question('Please give json file path \n', (answer) => {
        filePath = answer;
        rl.question('Your base function name \n', (answer) => {
            let rawdata = fs.readFileSync(filePath);
            try {
                var baseName = answer || "Base";
                var parsedJson = JSON.parse(rawdata);
                var res = createJSModels(parsedJson, baseName);
                WriteResultToFile(res);
            }
            catch (e) {
                console.log("Unable to parse Json.");
                console.log("=================================");
                ReadInputs();
            }
        });
    });
}


function WriteResultToFile(content) {
    var fileName = 'JSFunctions.js';
    fs.writeFile(fileName, content, function (err) {
        if (err) {
            console.log(`error occurred while writing file ${err}`);
            ReadInputs();
        }
        else {
            console.log(`${fileName} File is created.`);
            process.exit();
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
            result = func + "\n\n" + result;
        }
        var prop = "";
        if (typeof val != "object" || Array.isArray(val)) {
            prop = `this.${element} =args.${element} ||  ${getDefaultValue(val)}`
        }
        else {
            prop = `this.${element} =${getDefaultValue(val, element)}`
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
            result = `new ${toPasacalCase(name)}(args.${name})`;
            break;
        };

    };
    return result;
}