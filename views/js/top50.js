var c = 1;
var counts = [];
var ids = [];
var first = true;

for (var l = 1; l <= 5; l++) {
    var htmlrow = `<div class="row_${l} row"></div>`;
    $('.counters').append(htmlrow);
    for (var t = 1; t <= 10; t++) {
        var cc = ""
        if (c < 10) { cc = "0" + c; } else { cc = c; }
        var htmlcard = `<div class="channel_${c} card" id="card_thing_${c}" onclick="goToProfile(${c - 1})">
      <div class="rank">${cc}</div>
      <img src="./images/favicon.ico" class="image" id="img_${c}">
      <div class="name">Loading...</div>
      <div class="count odometer" id="count_${c}">0</div>
      </div>`;
        $('.row_' + l).append(htmlcard);
        c += 1;
    }
}

const goToProfile = (index) => {
    window.location.href = "/user/" + ids[index];
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
            setTimeout(function () { colorSwap(cnb, ""); }, 1000);
        }
        counts[q] = data.followersCount;
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
        if (first) {
            setTimeout(function () { $('.loader').fadeOut(); $('.counters').fadeIn(1); }, 1)
            first = false;
            setInterval(updateChannels, 5000);
        }
    });
};
updateChannels();

function colorSwap(cnb, color) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = color;
}