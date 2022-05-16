const searchForm = document.getElementById('search-form')
const searchBy = document.getElementById('param')
const search = document.querySelector('input')
class Book {
    constructor(cover, title) {
        this.cover = cover,
        this.title = title
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
    getBooks()
    search.value = ''
})

function getBooks() {
    fetch(`http://openlibrary.org/search.json?${searchBy.value}=${search.value}&limit=10`)
    .then(res => res.json())
    .then(books => {
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

function getBookDetails(url) {
    fetch(url)
    .then(res => res.json())
    .then(book => {
        currentBook = new Book(`https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`, book.title)
        book.by_statement === undefined ? currentBook.author = currentAuthor : currentBook.author = book.by_statement
        book.description === undefined ? currentBook.description = 'Sorry, there is no description available for this book' : currentBook.description = book.description
        if (typeof book.description === 'object') {
            currentBook.description = book.description.value
        }
        currentBook.publisher = book.publishers[0]
        currentBook.publishDate = book.publish_date
        if (book.series !== undefined) {
            currentBook.series = book.series
        }
        renderDetailedBook(currentBook)
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