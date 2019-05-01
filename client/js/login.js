var app = new Vue({

    // Elemento que o aplicativo será iniciado
    el: "#app",

    //Funções globais
    mixins: [MIXIN],

    // Propriedades do login
    data: {
        mail: {
            text: '',
            hasError: false,
            error: ''
        },
        password: {
            text: '',
            hasError: false,
            error: ''
        },
        loading: false
    },

    // Quando iniciado o aplicativo
    created: function() {

        //Verifica se já tem sessão
        this.hasUser()
    },

    // Métodos do aplicatvo
    methods: {

        tryLogin: function() {
            if (!this.validForm())
                return
            
            this.setUser(this.mail.text)
            document.location.href = APP
        },

        validForm: function() {
            let result = true

            if(!this.password.text){
                this.password.hasError = true
                this.password.error = "Senha obrigatória"
                result = false
            }

            if(!this.mail.text){
                this.mail.hasError = true
                this.mail.error = "E-mail obrigatório"
                return false
            }

            if (!this.validEmail(this.mail.text)){
                this.mail.hasError = true
                this.mail.error = "E-mail inválido, por favor coloque um e-mail válido"
                result = false
            }

            return result
        }
    },

    computed: {
        mailText() {
            return this.mail.text;
        },
        passText() {
            return this.password.text;
        }
    },

    watch: {
        mailText: function (val) {
            if (val.length > 0){
                this.mail.hasError = false
            }
        },
        passText: function (val) {
            if (val.length > 0){
                this.password.hasError = false
            }
        }
    }

});