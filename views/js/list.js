let start = 0;
let end = 15;
let searching = false;

async function getNextBatch(force) {
    await fetch('/api/list', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "start": start,
            "end": end,
            "sort": document.getElementById("sort").value,
            "order": document.getElementById("order").value,
            "type": type,
            "force": force
        })
    }).then(response => response.json())
        .then(data => {
            if (start == 0) {
                document.getElementById("results").innerHTML = "";
            }
            if (data.success) {
                if (!data.data) {
                    makeCard(data.user, 0, true);
                } else {
                for (let i = 0; i < data.data.length; i++) {
                    let user = data.data[i];
                    makeCard(user[1], i);
                }
            }
            }
            start = end;
            end += 10;
        })
}

function makeCard(channel, i, force) {
    if (!channel.banner) {
        channel.banner = channel.avatar;
    }
    let div = document.createElement("div");
    div.className = "result";
    div.onclick = () => {
        window.location.href = `/user/${channel.did}`
    };
    let rank = "#"+(start + i + 1)+" ";
    let gainMaybe = `<h2 class="overlay-label">${channel.followersCount.toLocaleString('en-us')} followers | ${channel.postsCount.toLocaleString('en-us')} posts | ${channel.followsCount.toLocaleString('en-us')} following</h2>`;
    if (channel.gained) {
        gainMaybe = `<h2 class="overlay-label">Follows +${channel.gained.followersCount.toLocaleString('en-us')} | Posts +${channel.gained.postsCount.toLocaleString('en-us')} | Following +${channel.gained.followsCount.toLocaleString('en-us')}</h2>`;
    }
    if (force) {
        gainMaybe = `<h5 class="overlay-label" style="font-size: 1.5rem;">Followers ${channel.followersCount.toLocaleString('en-us')}</h5>`;
        rank = "";
    }
    div.innerHTML = `
                <div class="background-image" style="background: url('${channel.banner}') no-repeat center center; background-size: cover;"></div>
                <div class="overlay">
                <img src="${channel.avatar}" alt="Profile Picture" class="profile-picture">
                  <h3 class="overlay-label">${rank}${channel.displayName}</h3>
                  <h6 class="overlay-label">@${channel.handle}</h6>
                  ${gainMaybe}
                  <hr><h5 class="overlay-label">Joined: ${moment(channel.createdAt).format('MMMM Do, YYYY')}</h5>
                  <h4 class="overlay-label">${channel.description ? channel.description : ""}</h4>
                </div>`;
    document.getElementById("results").appendChild(div);
    searching = false;
}

if (!window.location.href.includes("force")) {
    getNextBatch();
} else {
    getNextBatch(window.location.href.split("force=")[1]);
}

document.addEventListener('scroll', () => {
    if (searching == false) {
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 50) {
            searching = true;
            getNextBatch();
        }
    }
});

function getUsers() {
    start = 0;
    end = 10;
    getNextBatch();
}