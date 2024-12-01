var c = 1;
var counts = [];
var ids = [];
let interval;

for (var l = 1; l <= 5; l++) {
    var htmlrow = `<div class="row_${l} row"></div>`;
    $('.counters').append(htmlrow);
    for (var t = 1; t <= 10; t++) {
        var cc = ""
        if (c < 10) { cc = "0" + c; } else { cc = c; }
        var htmlcard = `<div class="channel_${c} card" id="card_thing_${c}">
      <div class="rank">${cc}</div>
      <img src="./default.png" class="image" id="img_${c}">
      <div class="name">Loading...</div>
      <div class="count odometer">0</div>
      </div>`;
        $('.row_' + l).append(htmlcard);
        c += 1;
    }
}

function updateData(q, data) {
    return setTimeout(function () {
        var cnb = q + 1;
        if (document.getElementById("img_" + cnb + "").src != data.avatar) {
            document.getElementById("img_" + cnb + "").src = data.avatar;
        }
        $(".channel_" + cnb + " .name").html(data.displayName);
        $(".channel_" + cnb + " .count").html(Math.floor(data.followersCount));
        if ((counts[q] == data.followersCount) == false) {
            colorSwap(cnb, "#d9e3f2");
            setTimeout(function () { colorSwap(cnb, "#f4f4f8"); }, 1000);
        }
        counts[q] = data.followersCount;
        if (q == 0) {
            console.log("Updated all channels");
            setTimeout(function () { $('.loader').fadeOut(); $('.counters').fadeIn(1); }, 1)
        }
    }, q * 500);
}

function updateChannels() {
    fetch("/api/top50", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(data => data.json()).then(data => {
        ids = [];
        for (var q = 0; q < 50; q++) {
            ids.push(data[q][0]);
            updateData(q, data[q][1]);
        }
        clearInterval(interval);
        interval = setInterval(updateChannels, 10000);
    });
};
updateChannels();

function colorSwap(cnb, color) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = color;
    //"#d9e3f2";
    //"#f4f4f8";
}