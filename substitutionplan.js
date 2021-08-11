const cheerio = require('cheerio');
const titles = ["klasse", "datum", "stunde", "lehrer", "vertreter", "fach", "raum", "art", "text"];

function parse(html) {
    var infos = {};

    // Load the html into cheerio
    var $ = cheerio.load(html);

    // Extract the date, weekday and a/b week from the title
    var title = $('.mon_title').text().split(" ");
    infos.date = title[0].split(".").reverse().map(x => (x.length < 2) ? "0" + x : x).join("-");
    infos.day = title[1].replace(",", "");
    infos.week = title[3];

    // Get the export timestamp
    infos.timestamp = $('.mon_head td').text().split("Stand: ")[1].replace(/[\s\n]*$/g, "");

    var data = [];
    var list = $('table.mon_list tr.list');
    list = $('table.mon_list tr.list');
    list.each((rowcnt, row) => {
        var rowData = {};

        var columns = $(row).find("td")
        var columns = $(row).find("td");
        if (columns.text() == "") return;
        if (columns.text().includes("Keine Vertretungen")) return;

        columns.each((columncnt, column) => {
            var text = $(column).text();
            var cleantext = text.replace("\\n", "").replace(/[\s]*$/, "");
            var columntitle = titles[columncnt];

            // Reformat date
            if (columntitle == "datum") {
                if (!cleantext) return;
                // Use the year from the title
                cleantext += infos.date.split("-")[0];
                // Change date string (ex. 1.10.2021 to 2021-10-01)
                cleantext = cleantext.split(".").reverse().map(x => (x.length < 2) ? "0" + x : x).join("-");
            }

            rowData[columntitle] = cleantext;
        })

        data.push(rowData);
    });

    infos.changes = data;
    return infos;
}

module.exports = {
    parse: parse
};