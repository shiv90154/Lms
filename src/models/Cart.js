import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});

// Virtual for effective price per item
cartItemSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.price;
});

// Virtual for total price for this item
cartItemSchema.virtual('totalPrice').get(function () {
    return this.effectivePrice * this.quantity;
});

// Virtual for total savings for this item
cartItemSchema.virtual('totalSavings').get(function () {
    if (!this.discountPrice) return 0;
    return (this.price - this.discountPrice) * this.quantity;
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalSavings: {
        type: Number,
        default: 0,
        min: 0
    },
    itemCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
cartSchema.index({ user: 1 });
cartSchema.index({ 'items.book': 1 });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function (next) {
    let totalAmount = 0;
    let totalSavings = 0;
    let itemCount = 0;

    this.items.forEach(item => {
        const effectivePrice = item.discountPrice || item.price;
        totalAmount += effectivePrice * item.quantity;

        if (item.discountPrice) {
            totalSavings += (item.price - item.discountPrice) * item.quantity;
        }

        itemCount += item.quantity;
    });

    this.totalAmount = totalAmount;
    this.totalSavings = totalSavings;
    this.itemCount = itemCount;

    next();
});

// Static method to find cart by user
cartSchema.statics.findByUser = function (userId) {
    return this.findOne({ user: userId }).populate('items.book');
};

// Static method to create or get cart for user
cartSchema.statics.getOrCreateCart = async function (userId) {
    let cart = await this.findByUser(userId);
    if (!cart) {
        cart = new this({ user: userId, items: [] });
        await cart.save();
    }
    return cart;
};

// Instance method to add item to cart
cartSchema.methods.addItem = async function (bookId, quantity = 1, price, discountPrice = null) {
    const existingItemIndex = this.items.findIndex(
        item => item.book.toString() === bookId.toString()
    );

    if (existingItemIndex > -1) {
        // Update existing item
        this.items[existingItemIndex].quantity += quantity;
        this.items[existingItemIndex].price = price;
        this.items[existingItemIndex].discountPrice = discountPrice;
    } else {
        // Add new item
        this.items.push({
            book: bookId,
            quantity,
            price,
            discountPrice
        });
    }

    await this.save();
    return this;
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = async function (bookId, quantity) {
    const itemIndex = this.items.findIndex(
        item => item.book.toString() === bookId.toString()
    );

    if (itemIndex === -1) {
        throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
        this.items.splice(itemIndex, 1);
    } else {
        this.items[itemIndex].quantity = quantity;
    }

    await this.save();
    return this;
};

// Instance method to remove item from cart
cartSchema.methods.removeItem = async function (bookId) {
    this.items = this.items.filter(
        item => item.book.toString() !== bookId.toString()
    );
    await this.save();
    return this;
};

// Instance method to clear cart
cartSchema.methods.clearCart = async function () {
    this.items = [];
    await this.save();
    return this;
};

// Instance method to check if item exists in cart
cartSchema.methods.hasItem = function (bookId) {
    return this.items.some(item => item.book.toString() === bookId.toString());
};

// Instance method to get item by book ID
cartSchema.methods.getItem = function (bookId) {
    return this.items.find(item => item.book.toString() === bookId.toString());
};

// Instance method to validate cart items against current book data
cartSchema.methods.validateItems = async function () {
    const Book = mongoose.model('Book');
    const validationResults = [];

    for (const item of this.items) {
        const book = await Book.findById(item.book);

        if (!book || !book.isActive) {
            validationResults.push({
                itemId: item._id,
                bookId: item.book,
                issue: 'Book not available',
                action: 'remove'
            });
            continue;
        }

        if (!book.checkStock(item.quantity)) {
            validationResults.push({
                itemId: item._id,
                bookId: item.book,
                issue: 'Insufficient stock',
                availableStock: book.stock,
                requestedQuantity: item.quantity,
                action: 'update_quantity'
            });
        }

        // Check if prices have changed
        if (item.price !== book.price || item.discountPrice !== book.discountPrice) {
            validationResults.push({
                itemId: item._id,
                bookId: item.book,
                issue: 'Price changed',
                oldPrice: item.price,
                newPrice: book.price,
                oldDiscountPrice: item.discountPrice,
                newDiscountPrice: book.discountPrice,
                action: 'update_price'
            });
        }
    }

    return validationResults;
};

// Ensure virtual fields are serialized
cartItemSchema.set('toJSON', {
    virtuals: true
});

cartSchema.set('toJSON', {
    virtuals: true
});

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default Cart;