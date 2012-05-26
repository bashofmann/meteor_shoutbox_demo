Template.stream.entries = function () {
    return ShoutBoxEntryCollection.find({}, {sort:{date:-1}});
};

Template.stream.username = function () {
    return Session.get("username");
};

Template.input.events = {
    'submit form':function (event) {
        event.preventDefault();
        ShoutBoxEntryCollection.insert({
            username:Session.get("username"),
            text:this.$('#text').attr('value'),
            date: new Date()
        });
        this.$('#text').attr('value', '');
    }
};

Template.login.events = {
    'submit form':function (event) {
        event.preventDefault();
        Session.set("username", this.$('#username').attr('value'));
    }
};
Template.logout.events = {
    'submit form':function (event) {
        event.preventDefault();
        Session.set("username", null);
    }
};