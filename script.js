let currentUser
const searchForm = document.getElementById('search-form')
const searchBy = document.getElementById('param')
const searchInput = document.querySelector('#search-input')
document.getElementById('create-error').style.display = 'none'
document.getElementById('login-error').style.display = 'none'
class Config {
    constructor(method, body) {
        this.method = method,
        this.headers = {
            "Content-type": "application/json",
            "Accept": "application/json"
        },
        this.body = JSON.stringify(body)
    }
}

Array.from(document.getElementsByClassName('toggle-forms')).map(btn => {
    btn.addEventListener('click', e => toggleForms(e))
})
document.getElementById('create-account').style.display = 'none'

function toggleForms(e) {
    if (e.target.textContent === 'Create Account') {
        document.getElementById('login').style.display = 'none'
        document.getElementById('create-account').style.display = ''
    } else {
        document.getElementById('login').style.display = ''
        document.getElementById('create-account').style.display = 'none'
    }
}

let currentBook
let currentAuthor

searchForm.addEventListener('submit', e => {
    e.preventDefault()
    if (document.getElementById('results-header') !== null) {
        document.getElementById('results-header').remove()
    }
    if (document.getElementsByClassName('search-switch').length === 2) {
        Array.from(document.getElementsByClassName('search-switch')).map(btn => btn.remove())
        Array.from(document.getElementsByClassName('search-active-btns')).map(btn => btn.remove())
        Array.from(document.getElementsByClassName('search-next-btns')).map(btn => btn.remove())
        Array.from(document.getElementsByClassName('search-previous-btns')).map(btn => btn.remove())
    }
    h3 = document.createElement('h3')
    h3.className = searchInput.value.split(' ').join('-')
    h3.id = 'results-header'
    h3.textContent = `Results for ${searchInput.value}`
    document.getElementById('book-search').appendChild(h3)
    getBooks(0)
    searchInput.value = ''
})

function getBooks(offset) {
    const searchFor = document.getElementById('results-header').className.split('-').join('+')
    fetch(`http://openlibrary.org/search.json?${searchBy.value}=${searchFor}&limit=10&offset=${offset}`)
    .then(res => res.json())
    .then(books => {

        // Code to create and activate buttons for page numbers
        let pages = Math.ceil(books.numFound / 10)
        if (pages > 1 && document.getElementsByClassName('search-active-btns').length === 0) {
            pageButton(pages, 'book-search', 'search')
        }


        let searchResults
        searchResults = document.getElementById('search-results')
        if (searchResults !== null) {
            searchResults.remove()
        }
        searchResults = document.createElement('div')
        searchResults.id = 'search-results'
        const ul = document.createElement('ul')
        ul.id = 'result-list'
        searchResults.appendChild(ul)
        document.getElementById('book-search').appendChild(searchResults)
        books.docs.map(book => renderBookResults(book))
    })
}

function pageButton(pages, id, list) {
    const backButton = document.createElement('button')
    backButton.textContent = 'See Previous'
    backButton.className = `${list}-switch`
    document.getElementById('book-search').appendChild(backButton)
    document.getElementById('book-search').appendChild(document.createElement('br'))
    for (let i = 1; i <= pages; i++) {
        searchResultPages(i, id)
    }
    document.getElementById('book-search').appendChild(document.createElement('br'))
    const nextButton = document.createElement('button')
    nextButton.textContent = 'See Next'
    nextButton.className = `${list}-switch`
    document.getElementById('book-search').appendChild(nextButton)
    const pageBtns = Array.from(document.getElementsByClassName('result-btn'))
    pageBtns.slice(0, 5).map(btn => btn.className = `${list}-active-btns`)
    for (let i = 0; i < pages; i++) {
        let oset = i * 10
        pageBtns[i].addEventListener('click', (e) => {
            getBooks(oset)
            Array.from(document.getElementsByClassName(`${list}-active-btns`)).map(btn => btn.disabled = false)
            e.target.disabled = true
        })
    }
    document.getElementsByClassName(`${list}-active-btns`)[0].disabled = true
    pageBtns.slice(5).map(btn => btn.className = `${list}-next-btns`)
    nextButton.addEventListener('click', () => {
        document.getElementsByClassName(`${list}-active-btns`)[0].className = `${list}-previous-btns`
        document.getElementsByClassName(`${list}-next-btns`)[0].className = `${list}-active-btns`
        if (parseInt(document.getElementsByClassName(`${list}-active-btns`)[4].textContent, 0) === pageBtns.length) {
            nextButton.disabled = true
        }
        backButton.disabled = false
    })
    backButton.addEventListener('click', () => {
        document.getElementsByClassName(`${list}-active-btns`)[4].className = `${list}-next-btns`
        document.getElementsByClassName(`${list}-previous-btns`)[document.getElementsByClassName(`${list}-previous-btns`).length - 1].className = `${list}-active-btns`
        if (parseInt(document.getElementsByClassName(`${list}-active-btns`)[0].textContent, 0) === 1) {
            backButton.disabled = true
        }
        nextButton.disabled = false
    })
    backButton.disabled = true
}

function searchResultPages(i, id) {
    const btn = document.createElement('button')
    btn.textContent = i
    btn.className = 'result-btn'
    document.getElementById(id).appendChild(btn)
}

function getBookDetails(url) {
    fetch(url)
    .then(res => res.json())
    .then(book => {
        currentBook = {
            cover: `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`,
            title: book.title,
            publisher: book.publishers[0],
            publishDate: book.publish_date
        }
        book.by_statement === undefined ? currentBook.author = currentAuthor : currentBook.author = book.by_statement
        book.description === undefined ? currentBook.description = 'Sorry, there is no description available for this book' : currentBook.description = book.description
        if (typeof book.description === 'object') {
            currentBook.description = book.description.value
        }
        if (book.series !== undefined) {
            currentBook.series = book.series
        }
        renderDetailedBook(currentBook)
        return currentBook
    })
}

function renderBookResults(book) {
    const resultList = document.getElementById('result-list')
    const li = document.createElement('li')
    const bookUrl = `https://openlibrary.org/books/${book.cover_edition_key}.json`
    let cover
    book.cover_i === undefined ? cover = `<p>Sorry, no cover available for this book</p>` : cover = `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg" class="search-cover-image">`
    let author
    book.author_name.length > 1 ? author = `${book.author_name[0]} and ${book.author_name.length - 1} others` : author = book.author_name
    li.innerHTML = `
        ${cover}
        <h4>${book.title}</h4>
        <p>${author}</p>
        <button id="details-for-${book.key}">See more about this book</button>  
    `
    resultList.appendChild(li)
    document.getElementById(`details-for-${book.key}`).addEventListener('click', () => {
        getBookDetails(bookUrl)
        return currentAuthor = author
    })
}

function renderDetailedBook(bookObj) {
    if (document.getElementById('full-details') !== null) {
        document.getElementById('full-details').remove()
    }
    const fullDetails = document.createElement('div')
    fullDetails.id = 'full-details'
    let series
    bookObj.series === undefined ? series = 'N/A' : series = bookObj.series
    fullDetails.innerHTML = `
        <img class="float" src="${bookObj.cover}" alt="Cover for ${bookObj.title}">
        <h2>${bookObj.title}</h2>
        <h4>By ${bookObj.author}</h4>
        <h5>Published by: ${bookObj.publisher}</h5>
        <h5>Published: ${bookObj.publishDate}</h5>
        <br>
        <p>Series: ${series}</p>
        <br>
        <p>Description:
        <br>
        ${bookObj.description}</p>
    `
    document.getElementById('book-details').appendChild(fullDetails)
}

function createAccount() {
    const newUser = {
        name: document.getElementById('name').value,
        username: document.getElementById('new-username').value,
        password: document.getElementById('new-password').value
    }
    fetchUsers(newUser, 0, 'POST')
}

function fetchUsers(user, i, method) {
    fetch(`http://localhost:3000/users?username=${user.username}`)
    .then(res => res.json())
    .then((res) => {
        res.length === i ? success(user, method) : error(method)
    })
}

document.getElementById('create-account-form').addEventListener('submit', e => {
    e.preventDefault()
    createAccount()
})

function error(method) {
    let error 
    method === 'POST' ? error = document.getElementById('create-error') : error = document.getElementById('login-error')
    error.style.display = ''
    setTimeout(() => error.style.display = "none", 5000)
}

function success(user, method) {
    fetch('http://localhost:3000/users', new Config(method, user))
    .then(res => res.json())
    .then(user => {
        renderBasicUserInfo(user, method)
    })
}

function renderBasicUserInfo(user, method) {
    const div = document.createElement('div')
    div.id = 'user-lists'
    const h3 = document.createElement('h3')
    h3.textContent = `Logged in as ${user.username}`
    div.appendChild(h3)
    const logOutBtn = document.createElement('button')
    logOutBtn.textContent = 'Log Out'
    div.appendChild(logOutBtn)
    div.appendChild(document.createElement('br'))
    const span = document.createElement('span')
    const readBtn = document.createElement('button')
    readBtn.id = 'read-btn'
    readBtn.textContent = 'Read'
    span.appendChild(readBtn)
    const unreadBtn = document.createElement('button')
    unreadBtn.textContent = 'Want to Read'
    unreadBtn.id = 'unread-btn'
    span.appendChild(unreadBtn)
    div.appendChild(span)
    document.getElementById('user-info').appendChild(div)
    document.getElementById('login').style.display = 'none'
    document.getElementById('create-account').style.display = 'none'
    readBtn.disabled = true
}

function renderUserLists(books, id) {
    if (document.getElementById(id) !== null) {
        document.getElementById(id).remove()
    }
    const ul = document.createElement('ul')
    ul.id = id
    books.map(book => {
        let rating
        book.ownRating === undefined ? rating = 'You have not yet rated this book' : rating = `You have given this book a rating of ${book.rating} out of 5`
        const li = document.createElement('li')
        li.className = `li-for-${id}`
        li.innerHTML = `
            <img src="${book.cover}">
            <h4>${book.title}</h4>
            <p>${book.author}</p>
            <br>
            <p>${rating}</p>
            <button id="details-for-${book.title}">See more about this book</button>
        `
        ul.appendChild(li)
    })
    document.getElementById('user-info').appendChild(ul)
}

// function renderUserInfo(user) {
//     currentUser = user
//     document.getElementById('login').style.display = 'none'
//     document.getElementById('create-account').style.display = 'none'
//     const readBtn = document.createElement('button')
//     readBtn.textContent = 'Read'
//     document.getElementById('user-info').appendChild(readBtn)

// }