
const jsdom = require("jsdom");
const { db } = require("./db");
const { JSDOM } = jsdom;


function dumpChildren(element, tabs){

    let line = '';
    for(let i = 0 ; i < tabs; i++){
        line += '\t';
    }

    let tag = element.tagName;
    if (tag != null && tag.length > 0){
        line += tag;
//        console.log(line);
    }
    console.log(" - ")

    console.log(element.toString())

    for(let e in element.childNodes){
        let child = element.childNodes[e];        
        dumpChildren(child);
    }

}

function remove(str, removables){
    let result = str;
    for(let i in removables){
        let removable = removables[i];
        result = result.split(removable).join('');
    }


    return result;
}

function replace(str, remove, insert){
    return str.split(remove).join(insert)
}

function parseInputs(input) {
    let value = input.getAttribute('value');
    let begin = '"<p><b>';
    let removables = [begin, '</b></p>"', 
    '"<p>', '</p>"', '<b>', '</b>', '[', ']',
    '"<p class=\\"\\">', '"<p style=\\"text-align: center;\\">']

    if(value != null && value.indexOf(begin) == 2){
        let text = replace(value, '<br>', ' ');
        text = replace(text, '],', ']\n');
        text = remove(text, removables);

  //      console.log(' - ');
  //      console.log(text);

        return text; 
    }

    return null;
}

function updateDB(text, date, timestamp){
    const lines = text.split('\n');

    const campuses = [];
    const cases = [];
    const grades = [];

    for(let l in lines){
        values = lines[l].split(',');

        if (l == 0){
            for (let v in values){
                if (v > 0) {
                    grades.push(values[v])
                }
            }
        } else {
            let campusCases = [];
            cases.push(campusCases);

            for (let v in values){
                if (v == 0) {
                    campuses.push(values[v])
                } else {
                    campusCases.push(values[v])
                }
            }
        }
    }

    for (let c in campuses){
        let campus = campuses[c]
        let campusCases = cases[c]
        let summary = campus + ':';

        for (let g in grades) {
            let grade = grades[g];
            let gradeCases = campusCases[g];

            summary += ` ${grade}(${gradeCases})`

            let caseNumber = parseInt(gradeCases);
            if (!isNaN(caseNumber) ){
                console.log(`is number ${grade} ${caseNumber} `)
                db.commitUpdate(campus, grade, caseNumber, date, timestamp);
            }
        }
        console.log(summary)
    }


}

function reportedDate(content){
    const startTag = 'New Cases Reported&nbsp;on '
    const endTag = '&nbsp;'


    const startIndex = content.indexOf(startTag) + startTag.length
    const endIndex = content.indexOf(endTag, startIndex + 1);
    const sub = content.substring(startIndex , endIndex)

    console.log(`reportDate from ${startIndex} to ${endIndex} '${sub}'`)
    return sub;
}


exports.onHtml = function(content) {

    let date = reportedDate(content);    
    let timestamp = new Date().getTime()


    console.log(`timestamp ${timestamp}`)

    //console.log(content)
    const dom = new JSDOM(content);
    let tables = dom.window.document.querySelectorAll("input")

    for(t in tables){
        let table = tables[t];
        let parsed = table.tagName != null ? parseInputs(table) : null;
        if (parsed != null) {
            updateDB(parsed, date, timestamp);
        }
    }

}

