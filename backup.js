//Variable declarations and other "pre-game" expressions
let currentUser
let currentBook
let currentAuthor
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

class ReadBook {
    constructor(rating, review) {
        this.id = currentBook.id,
        this.cover = currentBook.cover,
        this.author = currentBook.author,
        this.title = currentBook.title,
        this.ownRating = rating,
        this.review = review
    }
}

//generic GET request function
function handleGet(url, fnc) {
    fetch(url)
    .then(res => res.json())
    .then(data => fnc(data))
}

//generic POST/PATCH function
function handlePostPatch(source, method, obj, fnc) {
    let url
    method === 'POST' ? url = `http://localhost:3000/${source}` : url = `http://localhost:3000/${source}/${obj.id}`
    fetch(url, new Config(method, obj))
    .then(res => res.json())
    .then(res => fnc(res))
}

//event listener to switch between login and create account forms
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
    if (document.getElementsByClassName(`${list}-previous-btns`).length === 0) {
        nextButton.disabled = true
    }
}

function searchResultPages(i, id) {
    const btn = document.createElement('button')
    btn.textContent = i
    btn.className = 'result-btn'
    document.getElementById(id).appendChild(btn)
}

function getBookDetailsFromLocal(olUrl, key) {
    function callback(book) {
        if (book.length !== 0 && book[0].olKey === key) {
            currentBook = book[0]
            renderDetailedBook(currentBook)
            return currentBook
        } else {
            getBookDetailsFromOl(olUrl)
        }
    }
    handleGet(`http://localhost:3000/books?olKey=${key}`, callback)
}

function getBookDetailsFromOl(url) {
    function callback(book) {
        currentBook = {
            cover: `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`,
            title: book.title,
            publisher: book.publishers[0],
            publishDate: book.publish_date,
            olKey: book.key,
            readBy: [],
            wantToRead: [],
            rating: {
                allRatings: [],
                total: 'none',
                average: 'none'
            },
            reviews: []
        }
        book.by_statement === undefined ? currentBook.author = currentAuthor[0] : currentBook.author = book.by_statement
        book.description === undefined ? currentBook.description = 'Sorry, there is no description available for this book' : currentBook.description = book.description
        if (typeof book.description === 'object') {
            currentBook.description = book.description.value
        }
        if (book.series !== undefined) {
            currentBook.series = book.series
        }
        renderDetailedBook(currentBook)
        return currentBook
    }
    handleGet(url, callback)
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
        getBookDetailsFromLocal(bookUrl, `/books/${book.cover_edition_key}`)
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
    
    fullDetails.appendChild(document.createElement('br'))
    
    const rating = document.createElement('h5')
    rating.id = 'rating'
    currentBook.rating.average === 'none' ? rating.textContent = 'Average Rating: This book has not been rated by any Book Wyrms' : rating.textContent = `Average Rating: ${currentBook.rating.average} out of 5`
    fullDetails.appendChild(rating)
    
    fullDetails.appendChild(document.createElement('br'))
    
    const readCount = document.createElement('h5')
    readCount.id = 'read-count'
    readCount.textContent = `This book has been read by ${currentBook.readBy.length} Book Wyrm(s), and ${currentBook.wantToRead.length} Book Wyrm(s) would like to read it`
    fullDetails.appendChild(readCount)
    
    fullDetails.appendChild(document.createElement('br'))

    const errorMsg = document.createElement('h3')
    errorMsg.textContent = "Please log in complete this action"
    fullDetails.appendChild(errorMsg)
    errorMsg.style.display = 'none'
    
    const rateForm = document.createElement('form')
    rateForm.id = 'rate-form'
    rateForm.innerHTML = `
        <select id="new-rating">
            <option value="5" selected>5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
        </select>
        <input type="submit" value="Rate!">
    `
    fullDetails.appendChild(rateForm)
    rateForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const newRating = document.getElementById('new-rating')
        currentBook.rating.allRatings.push(parseInt(newRating.value, 10))
        currentBook.rating.total === 'none' ? currentBook.rating.total = parseInt(newRating.value, 10) : currentBook.rating.total += parseInt(newRating.value, 10)
        currentBook.rating.average = currentBook.rating.total / currentBook.rating.allRatings.length
        function callback(book) {
            currentBook = book
            const alreadyRead = currentUser.readList.find(readBook => readBook.id === currentBook.id)
            if (alreadyRead === undefined) {
                currentUser.readList.push(new ReadBook(parseInt(newRating.value, 10), 'none'))
            } else {
                alreadyRead.ownRating = parseInt(newRating.value, 10)
            }
            function updateUser(user) {
                renderUserLists(user.readList, 'readList', 'read')
            }
            handlePostPatch('users', "PATCH", currentUser, updateUser)
            return currentBook
        }
        if (currentBook.readBy.find(user => user === currentUser.username) === undefined) {
            currentBook.readBy.push(currentUser.username)
        }
        currentBook.id === undefined ? handlePostPatch('books', 'POST', currentBook, callback) : handlePostPatch('books', 'PATCH', currentBook, callback)
    })
    rateForm.style.display = 'none'
    
    const rateBtn = document.createElement('button')
    rateBtn.id = 'rate-btn' 
    rateBtn.textContent = 'Rate this book'
    fullDetails.appendChild(rateBtn)
    rateBtn.addEventListener('click', () => {
        if (currentUser === undefined) {
            errorMsg.style.display = ''
            setTimeout(() => errorMsg.style.display = 'none', 3000)
        } else if (rateForm.style.display === 'none') {
            rateForm.style.display = ''
        }
    })
    if (currentUser !== undefined && currentUser.readList.find(book => book.id === currentBook.id && book.ownRating !== 'none') !== undefined) {
        rateBtn.disabled = true
    }
    
    const markRead = document.createElement('button')
    markRead.id = 'mark-read'
    markRead.textContent = 'Read'
    fullDetails.appendChild(markRead)
    markRead.addEventListener('click', () => {
        if (currentUser === undefined) {
            errorMsg.style.display = ''
            setTimeout(() => errorMsg.style.display = 'none', 3000)
        } else {
        bookDetailEventCallback('readBy', 'readList', 'read')
        }
    })
    if (currentUser !== undefined && currentUser.readList.find(book => book.id === currentBook.id) !== undefined) {
        markRead.disabled = true
    }
    
    const toRead = document.createElement('button')
    toRead.id = 'to-read'
    toRead.textContent = "Want to read"
    fullDetails.appendChild(toRead)
    toRead.addEventListener('click', () => {
        if (currentUser === undefined) {
            errorMsg.style.display = ''
            setTimeout(() => errorMsg.style.display = 'none', 3000)
        } else {
        bookDetailEventCallback('wantToRead', 'wishList', 'unread')
        }
    })
    if (currentUser !== undefined && currentUser.wishList.find(book => book.id === currentBook.id) !== undefined) {
        toRead.disabled = true
    }
}

function bookDetailEventCallback(bookList, userList, id) {
    function postPatchCallback(book) {
        renderDetailedBook(book)
            currentBook = book
            currentUser[userList].push(new ReadBook('none', 'none'))
            function updateUser(user) {
                renderUserLists(user[userList], userList, id)
            }
            handlePostPatch('users', "PATCH", currentUser, updateUser)
            return currentBook
    }
    if (currentUser !== undefined) {
        currentBook[bookList].push(currentUser.username)
        currentBook.id === undefined ? handlePostPatch('books', 'POST', currentBook, postPatchCallback) : handlePostPatch('books', 'PATCH', currentBook, postPatchCallback)
    }
}




//account functions
function createAccount() {
    const newUser = {
        name: document.getElementById('name').value,
        username: document.getElementById('new-username').value,
        password: document.getElementById('new-password').value,
        readList: [],
        wishList: [],
        ratings: [],
    }
    fetchUsers(newUser, 0, 'POST')
}

function logIn() {
    const user = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }
    fetchUsers(user, 1, 'GET')
}

function fetchUsers(user, i, method) {
    fetch(`http://localhost:3000/users?username=${user.username}`)
    .then(res => res.json())
    .then((res) => {
        if (res.length === 1 && res[0].password !== user.password) {
            error(method)
        }
        let userArg
        res.length === 1 ? userArg = res[0] : userArg = user
        res.length === i ? success(userArg, method) : error(method)
    })
}

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault()
    logIn()
})

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
    function newUser() {
        fetch('http://localhost:3000/users', new Config(method, user))
        .then(res => res.json())
        .then(user => {
            currentUser = user
            renderBasicUserInfo(user)
            return currentUser
        })
        }
    function returnUser() {
        currentUser = user
        renderBasicUserInfo(user)
        return currentUser
    }
    method === 'POST' ? newUser() : returnUser()
}

function renderBasicUserInfo(user) {
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
    document.getElementById('login-header').appendChild(div)
    document.getElementById('login').style.display = 'none'
    document.getElementById('create-account').style.display = 'none'
    if (user.readList.length === 0) {
        const emptyRead = document.createElement('p')
        emptyRead.textContent = 'You haven\'t put any books on your Read List yet!'
        emptyRead.id = 'readList'
        document.getElementById('read').appendChild(emptyRead)
    } else {
        renderUserLists(user.readList, 'readList', 'read')
    }
    if (user.wishList.length === 0) {
        const emptyWish = document.createElement('p')
        emptyWish.textContent = 'You haven\'t selected any books that you want to read!'
        emptyWish.id = 'wishList'
        document.getElementById('unread').appendChild(emptyWish)
    } else {
        renderUserLists(user.wishList, 'wishList', 'unread')
    }
    document.getElementById('unread').style.display = 'none'
    unreadBtn.addEventListener('click', () => {
        document.getElementById('unread').style.display = ''
        document.getElementById('read').style.display = 'none'
        unreadBtn.disabled = true
        readBtn.disabled = false
    })
    readBtn.addEventListener('click', () => {
        document.getElementById('read').style.display = ''
        document.getElementById('unread').style.display = 'none'
        readBtn.disabled = true
        unreadBtn.disabled = false
    })
    readBtn.disabled = true
}

function renderUserLists(books, id, divId) {
    if (document.getElementById(id) !== null) {
        document.getElementById(id).remove()
    }
    const ul = document.createElement('ul')
    ul.id = id
    books.map(book => {
        let rating
        book.ownRating === 'none' ? rating = 'You have not yet rated this book' : rating = `You have given this book a rating of ${book.ownRating} out of 5`
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
    document.getElementById(divId).appendChild(ul)
    if (currentBook !== undefined) {
        renderDetailedBook(currentBook)
    }
}