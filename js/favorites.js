export class GithubUser {
    static search(username) {
        const endpoint = `https://api.github.com/users/${username}`

        return fetch(endpoint)
        .then(data => data.json()) // transforma o dado em json
        .then(({login, name, public_repos, followers}) => ( //retorna um objeto de acordo com a API do Github
            {
                login,
                name,
                public_repos,
                followers,
            }
        ))
    }  
}


export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)

        this.load()
    }

    async add(username) {
        
        try {

            const userExists = this.entries.find(entry => entry.login === username)
            const input = this.root.querySelector('.search input')

            if(userExists) {
                input.value = '' 
                throw new Error(`Usuário ${username} já cadastrado!`)
            }


            const user = await GithubUser.search(username)
    
            if (user.login === undefined) {
                input.value = '' 
                throw new Error(`Usuário ${username} não encontrado!`)
            }            
            
            input.value = ''          
            this.entries = [user, ...this.entries]
            
            this.update()
            this.save()           
        }
        catch(error) {
            alert(error.message)
        }       
    }

    delete(user) {
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)
        
        this.entries = filteredEntries
        
        this.update()
        this.save()    
        this.checkIfTableIsEmpty()            
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    load() {
        // armazenandos os dados que serão passados na tabela no localStorage do Brownser.
        // JSON.parse converte o JSON para o objeto que está dentro do JSON (logo, vai transformar as strings com a informação de cada user em array).
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []    
    }
}


export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector("table tbody")
       
        this.update()
        this.onadd() 
        this.checkIfTableIsEmpty() 
     
  
    }

    
    removeAllRows() {      
       this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `                    
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="imagem de mayk brito">
                <a href="https://github.com/maykbrito" target="_blank">
                    <p class="highlight">Mayke Brito</p>
                    <span>/maykbrito</span>
                </a>
            </td>
            <td class="public_repos">200</td>
            <td class="followers">120000</td>
            <td>
                <button class="remove">Remover</button>
            </td>
            `
            return tr
    }


    update() {
        this.removeAllRows()  

        this.entries.forEach( (user) => {
            const row = this.createRow('tr')

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`

            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = '/' + user.login

            row.querySelector('.public_repos').textContent = user.public_repos

            row.querySelector('.followers').textContent = user.followers
            
            row.querySelector('.remove').onclick = () => {                              
                const removeMsg = this.root.querySelector('.remove-msg')

                if (removeMsg.classList.contains('hide')) {
                    removeMsg.classList.toggle('hide')
                }

                const confirm = removeMsg.querySelector('#confirm')
                const cancel = removeMsg.querySelector('#cancel')                

                confirm.onclick = () => {
                    removeMsg.classList.toggle('hide')
                    this.delete(user)
                }
                
                cancel.onclick = () => {removeMsg.classList.toggle('hide')}                
            }           

            this.tbody.append(row)
            this.save()
            this.checkIfTableIsEmpty()            
        })
    }       
  
       
    onadd() {
        const addButton = this.root.querySelector('#add-btn')

        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')
            this.add(value)            
        }
    }

    creatMsg() {
        this.divMsg = document.createElement('div')
        this.divMsg.classList.add('emptyTableMsg')
        
        this.divMsg.innerHTML = `
        <img src="assets/star.svg" alt="">
        <p>Nenhum favorito ainda</p>   
        `
        
        this.root.append(this.divMsg)
          
    }

    removeMsg() {
        const appChildren = this.root.children
        this.tbody = this.root.querySelector('tbody') 
       

        for(let entry in appChildren) {
            if(appChildren[entry] === this.divMsg) {
                this.root.removeChild(this.divMsg)       
            }                     
        }
    }
    

    
    checkIfTableIsEmpty() {
        const table = this.entries  

        if((Object.keys(table).length) === 0) {
            this.creatMsg()  
            this.tbody.style.height = '0rem'                    
        }
        else {
            this.removeMsg()
            this.tbody.style.height = '30rem'            
        }
    }
}       



