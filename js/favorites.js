import { GithubUser } from "./GitHubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }
  
  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }
  
  async add(username) {
    try {

      const userExist = this.entries.find(entry => entry.login.toUpperCase() === username.toUpperCase())
      const inputSearch = this.root.querySelector('#input-search');

      if(userExist) {
        inputSearch.value = "";
        throw new Error(`${username} já foi adicionado na sua lista de favoritos!`)
      }

      const user = await GithubUser.search(username)
      
      if(user.login === undefined) {
        inputSearch.value = "";
        throw new Error(`${username} não foi encontrado, tente novamente!`)
      }
      
      this.entries = [user, ...this.entries]
      this.update()
      this.save()
      inputSearch.value = "";

    } catch(error) {
      alert(error.message)
    }

  }
  
  delete(user) {
    this.entries = this.entries
      .filter(entry => entry.login !== user.login) 
  
    
    this.update()
    this.save()
  }

}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector('table tbody')


    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)

    }
  }

  update() {
    this.removeAllTr();

    const checkUser = this.entries.length != 0;
    
    if (checkUser) {

      this.entries.forEach( user => {
        const row = this.createRow()
        
        row.querySelector('.user img').src = `https://github.com/${user.login}.png`
        row.querySelector('.user img').alt = `Imagem de ${user.name}`
        row.querySelector('.user p').textContent = `${user.name}`
        row.querySelector('.user a').href = `https://github.com/${user.login}`
        row.querySelector('.user span').textContent = `/${user.login}` 
        row.querySelector('.repositories').textContent = `${user.public_repos}`
        row.querySelector('.followers').textContent = `${user.followers}`

        row.querySelector('.remove').onclick = () => {
          const isOk = confirm(`Tem certeza que deseja deletar ${user.name}?`)
          if(isOk) {
            this.delete(user)
          }
        }

        this.tbody.append(row)
      });

    } else {
      const noFavorites = this.createNoFavorites();
      this.tbody.append(noFavorites);
    }
  }

  createNoFavorites() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
       <td colspan= "4">
          <div  class="noFavorites">   
             <img src="./img/Estrela.svg" alt="Uma estrela com um rostinho">
             <h1>Nenhum favorito ainda</h1>
          </div>
       </td>
    `;
    return tr;
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class="user">
        <img src="" alt="">
        <a href="" target="_blank">
          <p></p>
          <span></span>
        </a>
      </td>
      <td class="repositories">
        22
      </td>
      <td class="followers">
        4
      </td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
      .forEach ((tr) => {
        tr.remove()
      })
    }
  }