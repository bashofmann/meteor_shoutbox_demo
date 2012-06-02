Meteor.startup(function () {
    var wolframAppId = 'API_KEY';
    var startUpDate = new Date();
    var query = ShoutBoxEntryCollection.find({
        text: {
            $regex: /^@sara\s/,
            $options: 'i'
        }
    });
    var saraErrorAnswer = function(username) {
        saraAnswer(username, 'I don\'t understand what you want');
    };
    var saraAnswer = function (username, text) {
        ShoutBoxEntryCollection.insert({
            username:'sara',
            text:'@' + username + ' ' + text,
            date:new Date()
        });
    };
    query.observe({
        added: function(entry) {
            if (new Date(entry.date) < startUpDate) {
                return;
            }
            var searchText = entry.text.substring(6);
            var username = entry.username;
            var url = 'http://api.wolframalpha.com/v2/query?appid=' + encodeURIComponent(wolframAppId) +
                      '&input=' + encodeURIComponent(searchText) + '&format=plaintext';
            var response = Meteor.http.get(url);
            if (response.statusCode === 200) {
                var parser = sax.parser();
                var i = 0;
                var j;
                var titles = [];
                var texts = [];

                parser.ontext = function (t) {
                    if (!t.match(/[a-zA-Z0-9]/)) {
                        return;
                    }
                    texts[i] = t;
                };
                parser.onopentag = function (node) {
                    if (node.name === 'POD') {
                        i++;
                        titles[i] = node.attributes.TITLE;
                    }
                };
                parser.onend = function() {
                    var answers = [];
                    if (i === 0) {
                        saraErrorAnswer(username);
                        return;
                    }
                    for (j = 1; j <= i; j++) {
                        if (!texts[j]) {
                            continue;
                        }
                        answers.push(titles[j] + ' ' + texts[j]);
                    }
                    saraAnswer(username, answers.join(', '));
                };

                parser.write(response.content).close();
            } else {
                saraErrorAnswer(username);
            }
        }
    });
});