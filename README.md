# Book Wyrm Book-Tracker App

## What It Does

The Book Wyrm app is an application for finding, rating, and reviewing books, as well as for seeing the average ratings and the reviews of other users. Despite the tongue-in-cheek declaration in the header, it is in fact a much-simplified knockoff of [Goodreads](https://www.goodreads.com/). Using it is pretty self-explanatory. On the left-hand side of the screen is a search form that will search [Open Library](https://openlibrary.org/) for books by either title or author, depending on which dropdown option is selected. The results are displayed on pages of ten books each, with buttons to navigate between pages. Each book is rendered with the cover image (if available), the title, the author's name, and a button to select the book to see more details. Clicking on the button will render a more detailed description of the book in the center of the webpage (unless the book has no cover image, which is a bug that I'm aware of but haven't gotten around to fixing yet). This description includes Book Wyrm-specific information where applicable, such as ratings, reviews, etc. Also included are buttons to rate, review, and mark as read/want to read, but an error message will be displayed if these buttons are clicked when no user is logged in, which takes us to the next part of the site. On the right-hand side is a login form, as well as a "create account" button to switch forms if a new user is being created. Once the login information is submitted (assuming that it's correct), buttons to display the read list and wish list for that user will be displayed, with the read list being the first list displayed by default. These lists are rendered similarly to the search result lists, with the user's rating and review (if applicable) added to the read list. In addition, there is a logout button that will remove the lists and bring back up the login form. As I said, navigating the app is fairly intuitive and self-explanatory, although (more on this soon) to function properly it needs json-server active and watching the db.json file.


## How It Works

The app accesses three different resources from two sources. The search form uses title or author search parameters to send a `GET` request to the Open Library [API](https://openlibrary.org/developers/api) on submission of the form and uses the data that the request returns to render the search result list. The other two resources, stored on the mock server created by json-server with db.json, are user information and book information for books that have been read or added to the wish list of Book-Wyrm users. Here's where things get a bit complicated. The script.js file contains two global unassigned variables, `currentBook` and `currentUser`. All of the information the app needs to function is stored in these variables as it becomes available. After the search results are rendered, clicking on the button to display more details will trigger code that will take up to two steps. First, a `GET` request will be sent to the local server's "book" resource to check if the book exists in the database. If it does, the book details will be rendered using the information returned from the request, and the request-response data will be assigned to the `currentBook` variable. If the book is not in the local database, the details will be rendered using the information obtained from Open Library in the search request, and a new object with information about the book will be constructed and assigned to the `currentBook` variable. Submitting the login form will send a `GET` request to the local "user" database, and if the login information is correct, the user information is rendered on the page and assigned to the `currentUser` variable. The "create account" form will first send a `GET` to make sure the chosen username isn't already taken, and if it's not a `POST` request will be sent to add the new user, and the data from the response will be assigned to `currentUser`. Clicking on the buttons that are displayed in the detailed description of the book will allow the user to mark the book as read or add it to the user's wish list, as well as rate and/or review the book. When one of these actions is taken, the `currentUser` and `currentBook` objects are updated accordingly. Then a `PATCH` is sent to "users" with `currentUser` as the body, and a `POST` or a `PATCH` is sent to "books" (depending on whether or not the book already exists in "books") with `currentBook` as the body. The response to these requests is then used to re-render the updated user and book information on the page.

Other than a few small bugs that I plan on getting to, this all works pretty much how I want it to. Here's a [video walkthrough](https://youtu.be/wNuC2Haitis) of me using the app. Thanks for checking it out!