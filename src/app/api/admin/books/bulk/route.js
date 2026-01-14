import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { verifyToken } from '@/lib/auth';

// POST /api/admin/books/bulk - Bulk operations on books
export async function POST(request) {
    try {
        await connectDB();

        const token = request.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { operation, data } = await request.json();

        switch (operation) {
            case 'create':
                return await bulkCreateBooks(data);
            case 'update':
                return await bulkUpdateBooks(data);
            case 'delete':
                return await bulkDeleteBooks(data);
            case 'updateStock':
                return await bulkUpdateStock(data);
            case 'updatePrices':
                return await bulkUpdatePrices(data);
            default:
                return NextResponse.json(
                    { error: 'Invalid operation' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error in bulk operation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function bulkCreateBooks(books) {
    try {
        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < books.length; i++) {
            try {
                const bookData = books[i];

                // Validate required fields
                const requiredFields = ['title', 'author', 'description', 'price', 'category', 'images', 'stock'];
                for (const field of requiredFields) {
                    if (!bookData[field]) {
                        throw new Error(`${field} is required`);
                    }
                }

                // Check for duplicate ISBN
                if (bookData.isbn) {
                    const existingBook = await Book.findOne({ isbn: bookData.isbn });
                    if (existingBook) {
                        throw new Error(`Book with ISBN ${bookData.isbn} already exists`);
                    }
                }

                const book = new Book(bookData);
                await book.save();

                results.success.push({
                    index: i,
                    book: book
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    data: books[i]
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Bulk create completed: ${results.success.length} successful, ${results.errors.length} errors`
        });

    } catch (error) {
        throw error;
    }
}

async function bulkUpdateBooks(updates) {
    try {
        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < updates.length; i++) {
            try {
                const { id, ...updateData } = updates[i];

                if (!id) {
                    throw new Error('Book ID is required');
                }

                const book = await Book.findByIdAndUpdate(
                    id,
                    { ...updateData, updatedAt: new Date() },
                    { new: true, runValidators: true }
                );

                if (!book) {
                    throw new Error('Book not found');
                }

                results.success.push({
                    index: i,
                    book: book
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    data: updates[i]
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Bulk update completed: ${results.success.length} successful, ${results.errors.length} errors`
        });

    } catch (error) {
        throw error;
    }
}

async function bulkDeleteBooks(bookIds) {
    try {
        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < bookIds.length; i++) {
            try {
                const id = bookIds[i];

                const book = await Book.findByIdAndDelete(id);

                if (!book) {
                    throw new Error('Book not found');
                }

                results.success.push({
                    index: i,
                    id: id,
                    title: book.title
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    id: bookIds[i]
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Bulk delete completed: ${results.success.length} successful, ${results.errors.length} errors`
        });

    } catch (error) {
        throw error;
    }
}

async function bulkUpdateStock(stockUpdates) {
    try {
        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < stockUpdates.length; i++) {
            try {
                const { id, stock, operation = 'set' } = stockUpdates[i];

                if (!id) {
                    throw new Error('Book ID is required');
                }

                if (stock < 0) {
                    throw new Error('Stock cannot be negative');
                }

                let updateQuery;
                if (operation === 'add') {
                    updateQuery = { $inc: { stock: stock } };
                } else if (operation === 'subtract') {
                    updateQuery = { $inc: { stock: -stock } };
                } else {
                    updateQuery = { stock: stock };
                }

                const book = await Book.findByIdAndUpdate(
                    id,
                    { ...updateQuery, updatedAt: new Date() },
                    { new: true }
                );

                if (!book) {
                    throw new Error('Book not found');
                }

                // Ensure stock doesn't go negative
                if (book.stock < 0) {
                    await Book.findByIdAndUpdate(id, { stock: 0 });
                    book.stock = 0;
                }

                results.success.push({
                    index: i,
                    book: {
                        id: book._id,
                        title: book.title,
                        stock: book.stock
                    }
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    data: stockUpdates[i]
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Bulk stock update completed: ${results.success.length} successful, ${results.errors.length} errors`
        });

    } catch (error) {
        throw error;
    }
}

async function bulkUpdatePrices(priceUpdates) {
    try {
        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < priceUpdates.length; i++) {
            try {
                const { id, price, discountPrice } = priceUpdates[i];

                if (!id) {
                    throw new Error('Book ID is required');
                }

                if (price < 0) {
                    throw new Error('Price cannot be negative');
                }

                if (discountPrice && discountPrice >= price) {
                    throw new Error('Discount price must be less than original price');
                }

                const updateData = { price, updatedAt: new Date() };
                if (discountPrice !== undefined) {
                    updateData.discountPrice = discountPrice;
                }

                const book = await Book.findByIdAndUpdate(
                    id,
                    updateData,
                    { new: true }
                );

                if (!book) {
                    throw new Error('Book not found');
                }

                results.success.push({
                    index: i,
                    book: {
                        id: book._id,
                        title: book.title,
                        price: book.price,
                        discountPrice: book.discountPrice
                    }
                });
            } catch (error) {
                results.errors.push({
                    index: i,
                    error: error.message,
                    data: priceUpdates[i]
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: results,
            message: `Bulk price update completed: ${results.success.length} successful, ${results.errors.length} errors`
        });

    } catch (error) {
        throw error;
    }
}