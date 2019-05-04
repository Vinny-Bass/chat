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
        loading: false
    },

    // Quando iniciado o aplicativo
    created: function() {

        this.loading = true
        axios
            .all([
                this.getUser(),
                this.getMessages()
            ])
            .then(axios.spread((user, messages) => {
                this.user = user.data.data
                this.messages = messages.data.data
                
                this.scrollDown();
                // Inicia a conexão com o websocket
                this.connect();
            }))
            .catch(e => {
                this.error = e
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
            return axios.post(SERVER + "msg/get_all.php")
        },

        getAge: function(str){
            let birthday = new Date(str)
            let ageDifMs = Date.now() - birthday.getTime()
            let ageDate = new Date(ageDifMs)
            return Math.abs(ageDate.getUTCFullYear() - 1970)
        },

        // Método responsável por iniciar conexão com o websocket
        connect: function(onOpen) {

            var self = this;

            // Conectando
            self.ws = new WebSocket('ws://localhost:8080?u=' + this.user.id + ',' + this.user.name);

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
                
                if (result.id == undefined && result.name == undefined) 
                    self.addMessage(result)
                else 
                    self.newUserOn(result)
            };

        },

        // Método responsável por adicionar uma mensagem de usuário
        addMessage: function(data) {
            this.messages.push(data);

            this.scrollDown();
        },

        //Chamado quando um usuário entra no chat
        newUserOn: function(data) {
            this.messages.forEach(element => {
                if(element.seen == undefined)
                    element.seen = [data]
                else
                    element.seen.push(data)
            })

            console.log(this.messages)
        },

        whoSeen: function(seen) {
            if (seen == undefined)
                return false
            
            return true
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
                user: self.user.name,
                text: self.text,
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
        }
    }

});