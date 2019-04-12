//this file needs heavy refactoring!

calls = [];
HTMLElement = typeof (HTMLElement) != 'undefined' ? HTMLElement : Element;

// SCROLL TO BOTTOM
var out = document.getElementById("requests_container");


HTMLElement.prototype.prepend = function (element) {
    if (this.firstChild) {
        return this.insertBefore(element, this.firstChild);
    } else {
        return this.appendChild(element);
    }
};
last_id = 0;

function addTestRequest(request) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    testData = '{ ' +
        '    "requestData": {' +
        '    "url": "http://google.com/hello/' + text + '?adib=true&khiar=1",' +
        '    "headers": [' +
        '      {' +
        '        "key": "khiar",' +
        '        "value": "wtf"' +
        '      },' +
        '      {' +
        '        "key": "khiar2",' +
        '        "value": "wtf2"' +
        '      }' +
        '    ],' +
        '    "method": "GET"' +
        '  },' +
        '  "headers": [' +
        '    {' +
        '      "key": "response header 1",' +
        '      "value": "wtasdfsadff"' +
        '    },' +
        '    {' +
        '      "key": "response header 2",' +
        '      "value": "wtdsfasdff2"' +
        '    }' +
        '  ],' +
        '  "tookTime": 47,' +
        '  "responseCode": ' + (Math.random() >= 0.5 ? 500 : 200) + ',' +
        '  "body": {"body" : "{\\"salam\\":true}"},' +
        '  "contentLength": 3700' +
        '}';
    processRequest(JSON.parse(testData));
}

function processRequest(call) {
    if (call.requestData != null) {
        last_id += 1;
        call['callId'] = last_id;
        calls.push(call);
        document.getElementById("requests_container").append(getRequestHTML(call));
        applySearch();
    }

}

function getJsonHtml(string) {
    return htmlToElement(
        '<pre><code class="json">' + string + '</code></pre>'
    )
}

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function getRequestHTML(response) {
    request = response.requestData;
    id = response.callId;
    url = request.url;
    responseCode = response.responseCode;
    method = request.method;
    tookTime = response.tookTime;
    isSuccess = (responseCode >= 200 && responseCode < 300);
    classname = isSuccess ? 'success' : 'failure';
    success = isSuccess ? "SUCCESS" : "FAILED";
    contentLength = response.contentLength / 1000;
    return htmlToElement('<div class="animatable request card ' + classname + '" id="' + id + '">' +
        '                 <div class="url">' +
        '                     <h3>' + method + '</h3>' +
        '                     <h2>' + url + '</h2>' +
        '                 </div>' +
        '                 <div class="meta">' +
        '                     <div class="response">' +
        '                       <span class="length">' +
        '                           ' + success + ' ' + responseCode + '' +
        '                         </span><span class="response_length">' +
        '                             <strong>' + contentLength + '</strong> Kilobytes' +
        '                         </span>' +
        '                     </div>' +
        '                     <div class="date-container">' +
        '                         <span class="time">' +
        '                             <strong>' + tookTime + '</strong>ms' +
        '                         </span><span class="date">' +
        '                             ' + getCurrentTime() + '</>' +
        '                         </span>' +
        '                         ' + '</div>' +
        '                     ' +
        '                 </div>' +
        '             </div>')
}


function setupClickHandlers() {
    $(document).on('click', '.request', function () {
        $(".request").removeClass("active");
        $(".selected-card").html($(this).clone().prop('id', 'selected_active_card')).off("click").off('mouseenter mouseleave').off('hover').unbind();
        var clickedId = (this.id);
        console.log(clickedId);
        $("#request_headers").html("");
        $("#response_headers").html("");
        $("#request_data").html("");
        $("#response_data").html("");
        $(".data-container ").show();
        call = calls.find(function (value) {
            return parseInt(value['callId']) === parseInt(clickedId)
        });
        console.log(call);
        call.requestData.headers.forEach(function (value) {
            $("#request_headers").append(createHighlightedRow(value['key'], value['value']))
        });
        call.headers.forEach(function (value) {
            $("#response_headers").append(createHighlightedRow(value['key'], value['value']))
        });
        url = call.requestData.url
        paramHTML = ""
        if (url.includes("?")) {

            params = url.substring(url.lastIndexOf('?'))
            urlParams = new URLSearchParams(params);
            urlParams.forEach(function (value, key) {
                paramHTML += createHighlightedRow(key, value)
            })
        }

        if (paramHTML.length > 1) {
            $("#request_params").html(paramHTML);
            $("#request_params_container").show()
        } else {
            $("#request_params_container").hide()

        }
        request_body = (call.requestData.body != null && call.requestData.body.body != null) ?
            formatBody(call.requestData.body.body)
            : "NO REQUEST BODY";
        response_body = (call.body != null && call.body.body != null) ?
            formatBody(call.body.body)
            : "NO RESPONSE BODY";
        $("#request_data").html(request_body);
        $("#response_data").html(response_body);
        document.querySelectorAll('code').forEach(function (codeBlock) {
            hljs.highlightBlock(codeBlock);
        });
        window.scrollTo({top: 0, behavior: 'smooth'});
        $(".main-requests").addClass("card-hider");

        $(".selected-card-container").show();
    });


}

$(".previous").on("click", function () {
    $(".main-requests").removeClass("card-hider");
    $(".data-container").hide();
    $(".selected-card-container").hide();
});

function createHighlightedRow(key, value) {
    return "<p> <span class='header_key'>" + key + " :</span><span class='header_value'>" + value + "</span></p>"

}

function formatBody(body) {
    try {
        return "<pre><code class=\"json\">" + JSON.stringify(JSON.parse(body), null, 2) + "</code></pre>"
    } catch (error) {
        return body
    }
}

setupClickHandlers();


$('.tabgroup > div').hide();
$('.tabgroup > div:first-of-type').show();
$('.tabs a').click(function (e) {
    e.preventDefault();
    var $this = $(this),
        tabgroup = '#' + $this.parents('.tabs').data('tabgroup'),
        others = $this.closest('li').siblings().children('a'),
        target = $this.attr('href');
    others.removeClass('active');
    $this.addClass('active');
    $(tabgroup).children('div').hide();
    $(target).show();

});


function getCurrentTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;

}


/**
 WEBSOCKET
 **/

function connectToWebSocket() {

    if ("WebSocket" in window) {

        var wesocketAddress = "ws://" + location.hostname + ":5003/";
        console.log(wesocketAddress);
        // Let us open a web socket
        var ws = new WebSocket(wesocketAddress);

        ws.onopen = function () {

            // Web Socket is connected, send data using send()
            ws.send('{"connected": true}');
            console.log("Message is sent...");
        };

        ws.onmessage = function (evt) {
            var data = evt.data;
            var received_msg = JSON.parse(data);
            var type = received_msg.type;
            if (type === 'RESPONSE') {
                processRequest(received_msg.data);
            } else if (type === 'BATCH_RESPONSE') {
                var allResponses = received_msg.data;
                allResponses.forEach(function (response) {
                    processRequest(response);
                })
            }

        };

        ws.onclose = function () {

            // websocket is closed.
            console.log("Connection is closed...");
        };
    } else {

        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}

connectToWebSocket();

$("#clear-button").click(function () {
    $("#requests_container").html("");
    $(".data-container").hide()
});
$("#url_search").on('keyup', function () {
    applySearch()
});

function applySearch() {
    console.log('searching');
    var value = $("#url_search").val().toLowerCase();
    $(".card").each(function () {
        if ($(this).find(".url h2").text().toLowerCase().search(value) > -1) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

/*
only for testing purposes*/
addTestRequest("khiar");
setInterval(function () {
    addTestRequest("khiar")
}, 1000);
