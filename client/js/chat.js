var app = new Vue({

    // Elemento que o aplicativo será iniciado
    el: "#app",

    // Propriedades do aplicativo
    data: {
        user: null,
        text: null,
        messages: [],
        ws: null,
        status: null,
        loading: false,
        hasMore: true,
        error: null
    },

    // Quando iniciado o aplicativo
    created: function() {
        window.addEventListener('beforeunload', this.handler)

        this.loading = true
        axios
            .all([
                this.getUser(),
                this.getMessages()
            ])
            .then(axios.spread((user, messages) => {
                this.user = user.data.data
                if (user.data.data == null) {
                    this.error = {
                        message: "Usuário não encontrado, pode ter sido excluido"
                    }
                    setTimeout(()=>{
                        this.signOut()
                    }, 1000)
                    return
                }
                this.messages = messages.data.data.reverse();
                
                this.scrollDown();
                // Inicia a conexão com o websocket
                this.connect();
            }))
            .catch(e => {
                this.error = e
                setTimeout(()=>{
                    //this.signOut()
                }, 1000)
            })
            .finally(() => {
                this.loading = false
            })
    },

    // Métodos do aplicatvo
    methods: {
        getUser: function(){
            let user = localStorage.getItem(USER_KEY)

            if(!user)
                document.location.href = APP + "/account"

            let data = {
                "id": user,
            }
            return axios.post(SERVER + "user/get_infos.php", data)
        },

        getMessages: function(){
            let user = localStorage.getItem(USER_KEY)

            if(!user)
                document.location.href = APP + "/account"

            return axios.post(SERVER + "msg/get_all.php", {id_getter: user})
        },

        getMoreMessages: function(){
            let count = this.messages.length

            let data = {
                limit: count + 20,
                start: count,
                id_getter: this.user.id
            }

            this.loading = true

            axios
                .post(SERVER + "msg/get_all.php", data)
                .then(r => {
                    this.messages = r.data.data.reverse().concat(this.messages);
                    console.log(r)
                    if(r.data.data.length < 20)
                        this.hasMore = false
                })
                .catch(e => {
                    this.error = e
                })
                .finally(() => {
                    this.loading = false
                })


        },

        getAge: function(str){
            if (!str)
                return false

            let birthday = new Date(str)
            let ageDifMs = Date.now() - birthday.getTime()
            let ageDate = new Date(ageDifMs)
            return Math.abs(ageDate.getUTCFullYear() - 1970)
        },

        // Método responsável por iniciar conexão com o websocket
        connect: function(onOpen) {

            var self = this
            this.setOnline(true)

            // Conectando
            self.ws = new WebSocket('ws://3.14.105.238:80?u=' + this.user.id + ',' + this.user.name);

            // Evento que será chamado ao abrir conexão
            self.ws.onopen = function() {
                self.addSuccessNotification('Conectado');
                // Se houver método de retorno
                if (onOpen) {
                    onOpen();
                }
            };

            // Evento que será chamado quando houver erro na conexão
            self.ws.onerror = function() {
                self.addErrorNotification('Não foi possível conectar-se ao servidor');
            };

            // Evento que será chamado quando recebido dados do servidor
            self.ws.onmessage = function(e) {
                let result = JSON.parse(e.data);
                
                if (result.newUser != true) 
                    self.addMessage(result)
                else 
                    self.newUserOn(result)
            };

        },

        setOnline: function(online){
            let data = {
                id: this.user.id,
                online: online ? 1 : 0
            }

            axios
                .post(SERVER + "user/set_online.php", data)
                .catch(() => {
                    window.location.reload(true)
                })
        },

        // Método responsável por adicionar uma mensagem de usuário
        addMessage: function(data) {
            this.messages.push(data)

            this.scrollDown()
        },

        //Chamado quando um usuário entra no chat
        newUserOn: function(data) {
            this.messages.forEach(element => {
                if(element.seen == undefined)
                    element.seen = [data]
                else
                    element.seen.push(data)
            })

            app.$forceUpdate();
        },

        removeDuplicatesSeen: function(array) {
            return array.filter((thing, index, self) =>
                index === self.findIndex((t) => (
                    t.name === thing.name
                ))
            )
        },

        whoSeen: function(seen, seeAll) {
            if (seen == undefined)
                return false

            seen = this.removeDuplicatesSeen(seen)

            let allNames = seen.map((element, index) => {
                if ((seen.length == 1 || seen.length == 2)  && index == 0)
                    return element.name

                if (index > 3 && !seeAll)
                    return ''

                if (index == 3 && !seeAll)
                    return ' e mais ' + (seen.length - 3).toString()

                if (seen.length - 1 == index)
                    return ' e ' + element.name
                    
                return element.name + ', '
            })
            return allNames.join('')
        },

        // Método responsável por adicionar uma notificação de sucesso
        addSuccessNotification: function(text) {
            this.status = {color: 'green', text: text};
        },

        // Método responsável por adicionar uma notificação de erro
        addErrorNotification: function(text) {
            this.status = {color: 'red', text: text};
        },

        // Método responsável por enviar uma mensagem
        sendMessage: function() {

            var self = this;

            // Se não houver o texto da mensagem ou o nome de usuário
            if (!self.text || !self.user.name || self.text.trim().length < 1) {
                // Saindo do método
                return;
            }

            // Se a conexão não estiver aberta
            if (self.ws.readyState !== self.ws.OPEN) {

                // Exibindo notificação de erro
                self.addErrorNotification('Problemas na conexão. Tentando reconectar...');

                // Tentando conectar novamente e caso tenha sucesso
                // envia a mensagem novamente
                self.connect(function() {
                    self.sendMessage();
                });

                // Saindo do método
                return;
            }

            // Envia os dados para o servidor através do websocket
            self.ws.send(JSON.stringify({
                name: self.user.name,
                text: self.text,
                id_user: self.user.id,
            }));

            let data = {
                id_sender: self.user.id,
                body: self.text
            }

            self.loading = false
            axios
                .post(SERVER + "msg/send.php", data)
                .catch(e => {
                    self.error = e
                })
                .finally(() => {
                    self.loading = false
                })

            // Limpando texto da mensagem
            self.text = null;

        },

        // Método responsável por "rolar" a scroll do chat para baixo
        scrollDown: function() {
            setTimeout(()=>{
                var container = this.$el.querySelector('#messages');
                container.scrollTop = this.$el.querySelector('#messages').scrollHeight * 5;
            })
        },

        signOut: function() {
            localStorage.removeItem(USER_KEY)
            document.location.href = APP + "/account"
        },

        handler: function () {
            this.setOnline(false)
        },

        toDate: function(str) {
            if(str.indexOf('/') > -1)
                return str

            let dateTimeParts= str.split(/[- :]/)
            dateTimeParts[1]--

            let dateObject = new Date(...dateTimeParts)
            let month = (dateObject.getMonth() + 1).toString().length == 1 ? 
                        "0" + (dateObject.getMonth() + 1).toString() : 
                        (dateObject.getMonth() + 1).toString()

            let date = dateObject.getDate().toString().length == 1 ? 
                        "0" + dateObject.getDate().toString() :
                        dateObject.getDate().toString()
            return date + "/" 
                    + month + "/" 
                    + dateObject.getFullYear() + " " 
                    + dateObject.getHours() + ":"
                    + dateObject.getMinutes() + ":"
                    + dateObject.getSeconds()
        }
    }

});