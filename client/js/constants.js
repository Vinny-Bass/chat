const APP = ""
const SERVER = "3.14.105.238/chat/server/api/src/"
const USER_KEY = '__uid'

const MIXIN = {
    methods: {
        hasUser: function() {
            if (localStorage.getItem(USER_KEY))
                document.location.href = APP
        },
        setUser: function(user) {
            localStorage.setItem(USER_KEY, user);

        },
        validEmail: function(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return re.test(email)
        },
    }
}