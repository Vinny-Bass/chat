Vue.component('warning', {
    props: {
        loading: false,
        error: false
    },
    watch: {
        error: function(){
            setTimeout(()=>{
                this.error = false;
            }, 2000)
        }
    },
    template: `
    <div>
        <div class="warning-error" v-if="error">
            <strong>Aconteceu algum erro</strong>
            <span>{{error.message}}</span>
        </div>

        <span class="loader" v-if="loading">
            <span class="loader-inner"></span>
        </span>
    </div>`
  })