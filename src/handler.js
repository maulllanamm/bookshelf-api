const { nanoid } = require("nanoid");
const books = require("./books");

const ErrorResponse = (message, code, h) => {
    const response = {
        status: "fail",
        message: message,
    };
    return h.response(response).code(code);
};

const SuccessResponse = (message, data, code, h) => {
    const response = {
        status: "success",
        message: message,
        data: data,
    };
    return h.response(response).code(code);
};

const addBookHandler = (request, h) => {
    const {
        name, year, author, summary, publisher,
        pageCount, readPage, reading,
    } = request.payload;

    // Validate payload
    if (!name) {
        return ErrorResponse("Gagal menambahkan buku. Mohon isi nama buku", 400,h);
    }

    if (readPage > pageCount) {
        return ErrorResponse("Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount", 400,h);
    }

    const id = nanoid(16);
    const finished = pageCount === readPage;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const newBook = {
        id, name, year, author, summary, publisher,
        pageCount, readPage, finished, reading,
        insertedAt, updatedAt,
    };

    books.push(newBook);

    return SuccessResponse("Buku berhasil ditambahkan", { bookId: id }, 201,h);
};

const getAllBooksHandler = (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = books;

    if (name) {
        const nameRegex = new RegExp(name, "gi");
        filteredBooks = filteredBooks.filter(book => nameRegex.test(book.name));
    }

    if (reading !== undefined) {
        const isReading = reading === '1';
        filteredBooks = filteredBooks.filter(book => book.reading === isReading);
    }

    if (finished !== undefined) {
        const isFinished = finished === '1';
        filteredBooks = filteredBooks.filter(book => book.finished === isFinished);
    }

    const response = {
        status: "success",
        data: {
            books: filteredBooks.map(book => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher,
            })),
        },
    };

    return h.response(response).code(200);
};

const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const book = books.find(book => book.id === bookId);

    if (!book) {
        return ErrorResponse("Buku tidak ditemukan", 404,h);
    }

    return SuccessResponse("Buku berhasil ditemukan", { book }, 200,h);
};

const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const {
        name, year, author, summary, publisher,
        pageCount, readPage, reading,
    } = request.payload;

    // Validate payload
    if (!name) {
        return ErrorResponse("Gagal memperbarui buku. Mohon isi nama buku", 400,h);
    }

    if (readPage > pageCount) {
        return ErrorResponse("Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount", 400,h);
    }

    const index = books.findIndex(book => book.id === bookId);

    if (index === -1) {
        return ErrorResponse("Gagal memperbarui buku. Id tidak ditemukan", 404,h);
    }

    const updatedAt = new Date().toISOString();
    const finished = pageCount === readPage;

    books[index] = {
        ...books[index],
        name, year, author, summary, publisher,
        pageCount, readPage, reading, finished, updatedAt,
    };

    return SuccessResponse("Buku berhasil diperbarui", books[index], 200,h);
};

const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;
    const index = books.findIndex(book => book.id === bookId);

    if (index === -1) {
        return ErrorResponse("Buku gagal dihapus. Id tidak ditemukan", 404,h);
    }

    books.splice(index, 1);

    return SuccessResponse("Buku berhasil dihapus", null, 200,h);
};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};
