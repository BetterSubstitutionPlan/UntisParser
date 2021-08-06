const cheerio = require('cheerio');
const titles = ["klasse", "datum", "stunde", "lehrer", "vertreter", "fach", "raum", "art", "text"];

function parse(html) {
    var infos = {};

    // Load the html into cheerio
    var $ = cheerio.load(html);

    // Extract the date, weekday and a/b week from the title
    title = $('.mon_title').text().split(" ");
    infos.date = title[0].split(".").reverse().map(x => (x.length < 2) ? "0" + x : x).join("-")
    infos.day = title[1].replace(",", "")
    infos.week = title[3]

    // Get the export timestamp
    infos.timestamp = $('.mon_head td').text().split("Stand: ")[1].replace(/[\s\n]*$/g, "");

    var data = [];
    list = $('table.mon_list tr.list');
    list.each((rowcnt, row) => {
        var rowData = {};

        var columns = $(row).find("td")
        if (columns.text() == "") return;
        if (columns.text().includes("Keine Vertretungen")) return;

        columns.each((columncnt, column) => {
            text = $(column).text()
            cleantext = text.replace("\\n", "").replace(/[\s]*$/, "")
            rowData[titles[columncnt]] = cleantext;
        })

        data.push(rowData)
    });
    infos.changes = data;

    // Reformat date
    data.forEach(element => {
        if(!element.datum) return;
        element.datum += infos.date.split("-")[0]
        element.datum = element.datum.split(".").reverse().map(x => (x.length < 2) ? "0" + x : x).join("-")
    })

    return infos;
}

module.exports = {
    parse: parse
};