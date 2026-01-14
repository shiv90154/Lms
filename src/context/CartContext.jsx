'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'SET_CART':
            return {
                ...state,
                cart: action.payload,
                loading: false,
                error: null
            };

        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };

        case 'ADD_ITEM':
            return {
                ...state,
                cart: action.payload
            };

        case 'UPDATE_ITEM':
            return {
                ...state,
                cart: action.payload
            };

        case 'REMOVE_ITEM':
            return {
                ...state,
                cart: action.payload
            };

        case 'CLEAR_CART':
            return {
                ...state,
                cart: {
                    items: [],
                    totalAmount: 0,
                    totalSavings: 0,
                    itemCount: 0
                }
            };

        default:
            return state;
    }
};

// Initial state
const initialState = {
    cart: {
        items: [],
        totalAmount: 0,
        totalSavings: 0,
        itemCount: 0
    },
    loading: false,
    error: null
};

export function CartProvider({ children }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Fetch cart on mount
    useEffect(() => {
        fetchCart();
    }, []);

    const getAuthToken = () => {
        return localStorage.getItem('accessToken');
    };

    const fetchCart = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                dispatch({ type: 'SET_CART', payload: initialState.cart });
                return;
            }

            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_CART', payload: data.data });
            } else if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                dispatch({ type: 'SET_CART', payload: initialState.cart });
            } else {
                dispatch({ type: 'SET_ERROR', payload: data.error });
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch cart' });
        }
    };

    const addToCart = async (bookId, quantity = 1) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to add items to cart');
            }

            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId, quantity })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'ADD_ITEM', payload: data.data });
                return { success: true, message: data.message };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const updateQuantity = async (bookId, quantity) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to update cart');
            }

            const response = await fetch('/api/cart', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookId, quantity })
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'UPDATE_ITEM', payload: data.data });
                return { success: true, message: data.message };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to remove items from cart');
            }

            const response = await fetch(`/api/cart/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'REMOVE_ITEM', payload: data.data });
                return { success: true, message: data.message };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const clearCart = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to clear cart');
            }

            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'CLEAR_CART' });
                return { success: true, message: data.message };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const validateCart = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });

            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to validate cart');
            }

            const response = await fetch('/api/cart/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                dispatch({ type: 'SET_CART', payload: data.data.cart });
                return {
                    success: true,
                    validationResults: data.data.validationResults,
                    hasChanges: data.data.hasChanges
                };
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            return { success: false, error: error.message };
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const isInCart = (bookId) => {
        return state.cart.items.some(item => item.book._id === bookId);
    };

    const getItemQuantity = (bookId) => {
        const item = state.cart.items.find(item => item.book._id === bookId);
        return item ? item.quantity : 0;
    };

    const value = {
        cart: state.cart,
        loading: state.loading,
        error: state.error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        validateCart,
        isInCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}