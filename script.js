const form = document.getElementById('search-form')
const searchBy = document.getElementById('param')
const search = document.querySelector('input')
class Book {
    constructor(cover, title) {
        this.cover = cover,
        this.title = title
    }
}

let currentBook
let currentAuthor

form.addEventListener('submit', e => {
    e.preventDefault()
    getBooks()
    search.value = ''
})

function getBooks() {
    fetch(`http://openlibrary.org/search.json?${searchBy.value}=${search.value}&limit=10`)
    .then(res => res.json())
    .then(books => {
        //console.log(books)
        books.docs.map(book => renderBookResults(book))
    })
}

function getBookDetails(url) {
    fetch(url)
    .then(res => res.json())
    .then(book => {
        console.log('book info',book)
        currentBook = new Book(`https://covers.openlibrary.org/b/id/${book.covers[0]}`, book.title)
        book.by_statement === undefined ? currentBook.author = currentAuthor : currentBook.author = book.by_statement
        book.description === undefined ? currentBook.description = 'Sorry, there is no description available for this book' : currentBook.description = book.description
        currentBook.publishDate = book.publish_date
        if (book.series !== undefined) {
            currentBook.series = book.series
        }
        //console.log(currentBook)
    })
}

function renderBookResults(book) {
    const searchResults = document.getElementById('search-results')
    const li = document.createElement('li')
    const bookUrl = `https://openlibrary.org/books/${book.cover_edition_key}.json`
    let cover
    book.cover_i === undefined ? cover = `<p>Sorry, no cover available for this book</p>` : cover = `<img src="https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" class="search-cover-image">`
    let author
    book.author_name.length > 1 ? author = `${book.author_name[0]} and ${book.author_name.length - 1} others` : author = book.author_name
    li.innerHTML = `
        ${cover}
        <h3>${book.title}</h3>
        <p>${author}</p>
        <button id="details-for-${book.key}">See more about this book</button>  
    `
    searchResults.appendChild(li)
    document.getElementById(`details-for-${book.key}`).addEventListener('click', () => {
        getBookDetails(bookUrl)
        return currentAuthor = author
    })
}