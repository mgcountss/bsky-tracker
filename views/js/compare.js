let dataget = "";
let id1 = document.URL.split('/compare/')[1].split('/')[0];
let id2 = document.URL.split('/compare/')[1].split('/')[1];
if (id2.includes('?')) {
    id2 = id2.split('?')[0];
}
let name1 = document.getElementById('title1').innerHTML;
let name2 = document.getElementById('title2').innerHTML;
let updateInterval;

let chart1 = new Highcharts.Chart({
    chart: {
        renderTo: 'chart1',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: false,
        name: '',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#FFF',
        lineWidth: 5
    }]
});
let chart2 = new Highcharts.Chart({
    chart: {
        renderTo: 'chart2',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: false,
        name: '',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#FFF',
        lineWidth: 5
    }]
});
let chart3 = new Highcharts.Chart({
    chart: {
        renderTo: 'chart3',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: false,
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: false,
        name: 'Difference',
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#FFF',
        lineWidth: 5
    }]
});

let stats_chart1 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart1',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Bluesky Tracker',
        href: 'https://bluesky.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s followers",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    }, {
        showInLegend: true,
        name: name2+"'s followers",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});
let stats_chart2 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart2',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Bluesky Tracker',
        href: 'https://bluesky.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s posts",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    },{
        showInLegend: true,
        name: name2+"'s posts",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});
let stats_chart3 = new Highcharts.Chart({
    chart: {
        renderTo: 'stats_chart3',
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    xAxis: {
        visible: false,
        type: 'datetime'
    },
    yAxis: {
        title: {
            text: ''
        },
        visible: false
    },
    title: {
        text: ' '
    },
    credits: {
        enabled: true,
        text: 'Bluesky Tracker',
        href: 'https://bluesky.mgcounts.com'
    },
    plotOptions: {
        series: {
            threshold: null,
            fillOpacity: 0.25
        },
        area: {
            fillOpacity: 0.05
        }
    },
    series: [{
        showInLegend: true,
        name: name1+"'s following",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#46e4a2',
        lineWidth: 5
    }, {
        showInLegend: true,
        name: name2+"'s following",
        marker: { enabled: false },
        color: '#FFF',
        lineColor: '#f44336',
        lineWidth: 5
    }],
});

dataget = document.URL.split('?live=')[1];
if (document.URL.includes('?live=followers')) {
    document.getElementById('live_label1').innerText = 'Followers';
    document.getElementById('live_label2').innerText = 'Followers';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Followers'
        }
    });
    chart1.series[0].update({
        name: 'Followers'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Followers'
        }
    });
    chart2.series[0].update({
        name: 'Followers'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
    document.getElementById('diff').style.display = 'block';
} else if (document.URL.includes('?live=following')) {
    document.getElementById('live_label1').innerText = 'Following';
    document.getElementById('live_label2').innerText = 'Following';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Following'
        }
    });
    chart1.series[0].update({
        name: 'Following'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Following'
        }
    });
    chart2.series[0].update({
        name: 'Following'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
    document.getElementById('diff').style.display = 'block';
} else if (document.URL.includes('?live=posts')) {
    document.getElementById('live_label1').innerText = 'Posts';
    document.getElementById('live_label2').innerText = 'Posts';
    updateInterval = setInterval(updateLive, 2000);
    updateLive();
    chart1.yAxis[0].update({
        title: {
            text: 'Posts'
        }
    });
    chart1.series[0].update({
        name: 'Posts'
    });
    chart2.yAxis[0].update({
        title: {
            text: 'Posts'
        }
    });
    chart2.series[0].update({
        name: 'Posts'
    });
    document.getElementById('liveCounter1').style.display = 'block';
    document.getElementById('liveCounter2').style.display = 'block';
    document.getElementById('diff').style.display = 'block';
}

function updateLive() {
    fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'ids': [id1, id2]
        })
    }).then(response => response.json())
        .then(data => {
            document.getElementById('live_name1').innerText = data.users[0].displayName.length > 0 ? data.users[0].displayName : '@'+data.users[0].username;
            document.getElementById('live_count1').innerText = data.users[0][dataget];
            chart1.series[0].addPoint([Date.now(), data.users[0][dataget]]);
            document.getElementById('live_name2').innerText = data.users[1].displayName.length > 0 ? data.users[1].displayName : '@'+data.users[1].username;
            document.getElementById('live_count2').innerText = data.users[1][dataget];
            chart2.series[0].addPoint([Date.now(), data.users[1][dataget]]);
            const diff = data.users[0][dataget] - data.users[1][dataget];
            document.getElementById('live_diff').innerText = diff;
            chart3.series[0].addPoint([Date.now(), diff]);
        });
}

function toggleLive() {
    window.location.href = '/compare/' + id1 + '/' + id2;
}

for (let i = 0; i < Object.keys(daily_stats1).length; i++) {
    let dateString = Object.keys(daily_stats1)[i];
    let [day, month, year] = dateString.split('-');
    let date = Date.parse(`${year}-${month}-${day}`);

    stats_chart1.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].followersCount]);
    stats_chart2.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].postsCount]);
    stats_chart3.series[0].addPoint([date, daily_stats1[Object.keys(daily_stats1)[i]].followsCount]);
}

for (let i = 0; i < Object.keys(daily_stats2).length; i++) {
    let dateString = Object.keys(daily_stats2)[i];
    let [day, month, year] = dateString.split('-');
    let date = Date.parse(`${year}-${month}-${day}`);

    stats_chart1.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].followersCount]);
    stats_chart2.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].postsCount]);
    stats_chart3.series[1].addPoint([date, daily_stats2[Object.keys(daily_stats2)[i]].followsCount]);
}