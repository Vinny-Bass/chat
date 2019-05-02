var app = new Vue({

    // Elemento que o aplicativo será iniciado
    el: "#app",

    //Funções globais
    mixins: [MIXIN],

    // Propriedades do login
    data: {
        code: {
            text: '',
            hasError: false,
            error: '',
            valid: false
        },
        name: {
            text: '',
            hasError: false,
            error: ''
        },
        mail: {
            text: '',
            hasError: false,
            error: ''
        },
        password: {
            text: '',
            hasError: false,
            error: '',
            confirm: ''
        },
        birth: '',
        nationality: '',
        title: '',
        research: '',
        collegeDegree: '',
        workLocation: '',
        loading: false,
        error: null
    },

    // Quando iniciado o aplicativo
    created: function() {

        //Verifica se já tem sessão
        this.hasUser()
    },

    // Métodos do aplicatvo
    methods: {

        sendUser: function() {
            if (!this.validForm())
                return
            
            this.loading = true
            let data = {
                "name": this.name.text,
                "email": this.mail.text,
                "pass": this.password.text,
                "birth": this.birth,
                "nationality": this.nationality,
                "title": this.title,
                "research": this.research,
                "college_degree": this.collegeDegree,
                "work_location": this.workLocation
            }

            axios
                .post(SERVER + "user/signup.php", data)
                .then(r => {
                    this.setUser(r.data.data.id)
                    document.location.href = APP
                })
                .catch(e => {
                    this.error = e
                })
                .finally(() => {
                    this.loading = false
                })
        },

        validForm: function() {
            let result = true

            if(!this.code.text){
                this.code.hasError = true
                this.code.error = "Código obrigatório"
                result = false
            }

            if (!this.code.valid) {
                if (this.code.text == "ICE_A1B2")
                    this.code.valid = true
                else {
                    this.code.hasError = true
                    this.code.error = "Código inválido"
                }
                
                return false
            }
                

            if(!this.password.text){
                this.password.hasError = true
                this.password.error = "Senha obrigatória"
                result = false
            
            } else {
                if(this.password.text != this.password.confirm){
                    this.password.hasError = true
                    this.password.error = "Senha divergentes"
                    result = false
                }
            }

            if(!this.name.text){
                this.name.hasError = true
                this.name.error = "Nome obrigatória"
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
        },
        nameText() {
            return this.name.text;
        },
        codeText() {
            return this.code.text;
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
        },
        nameText: function (val) {
            if (val.length > 0){
                this.name.hasError = false
            }
        },
        codeText: function (val) {
            if (val.length > 0){
                this.code.hasError = false
            }
        }
    }

});