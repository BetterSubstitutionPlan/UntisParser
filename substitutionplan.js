const cheerio = require('cheerio');
const titles = ["klasse", "datum", "stunde", "lehrer", "vertreter", "fach", "raum", "art", "text"];

function parse(html) {
    // Load the html
    var $ = cheerio.load(html);
    var data = [];
    var infos = {};

    title = $('.mon_title').text().split(" ");
    infos.day = title[1]
    infos.date = title[0]
    infos.week = title[3]
    infos.stand = "Stand" + $('.mon_head td').text().split("Stand")[1].replace("\\n", "").replace(/[\s]*$/, "");

    list = $('table.mon_list tr.list');
    rowcnt = 0;
    list.each(function () {
        data[rowcnt] = {};

        var arr = $(this).find("td")

        if (arr.text() == "") {
            return;
        }

        arr.each((spancnt, element) => {
            text = $(element).text()
            cleantext = text.replace("\\n", "").replace(/[\s]*$/, "")
            data[rowcnt][titles[spancnt]] = cleantext;
        })

        rowcnt++;
    });
    infos.changes = data;

    data.forEach((element) => {
        let data = element.datum;
        element.datum = "";

        data = data.split(".")

        element.datum += new Date().getFullYear() + "-"
        element.datum += data[1] + "-"
        element.datum += data[0]
    })

    return data;
}

module.exports = {
    parse: parse
};