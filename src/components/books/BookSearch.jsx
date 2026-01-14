'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function BookSearch({
    value = '',
    onChange,
    onSearch,
    placeholder = "Search books, authors, categories...",
    showSuggestions = true
}) {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState(null);
    const [showSuggestionsList, setShowSuggestionsList] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    const debouncedSearchTerm = useDebounce(inputValue, 300);
    const searchRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('bookSearchHistory');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        }
    }, []);

    // Fetch suggestions when search term changes
    useEffect(() => {
        if (debouncedSearchTerm && debouncedSearchTerm.length >= 2 && showSuggestions) {
            fetchSuggestions(debouncedSearchTerm);
        } else {
            setSuggestions(null);
        }
    }, [debouncedSearchTerm, showSuggestions]);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target) &&
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestionsList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&suggestions=true`);
            const data = await response.json();

            if (data.success) {
                setSuggestions(data.data.suggestions);
                setShowSuggestionsList(true);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange?.(newValue);

        if (newValue.length >= 2) {
            setShowSuggestionsList(true);
        } else {
            setShowSuggestionsList(false);
            setSuggestions(null);
        }
    };

    const handleSearch = (searchTerm = inputValue) => {
        if (searchTerm.trim()) {
            // Add to recent searches
            const newRecentSearches = [
                searchTerm,
                ...recentSearches.filter(term => term !== searchTerm)
            ].slice(0, 5);

            setRecentSearches(newRecentSearches);
            localStorage.setItem('bookSearchHistory', JSON.stringify(newRecentSearches));

            onSearch?.(searchTerm);
            setShowSuggestionsList(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        handleSearch(suggestion);
    };

    const handleClearSearch = () => {
        setInputValue('');
        onChange?.('');
        setSuggestions(null);
        setShowSuggestionsList(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowSuggestionsList(false);
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('bookSearchHistory');
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (inputValue.length >= 2 || recentSearches.length > 0) {
                            setShowSuggestionsList(true);
                        }
                    }}
                    className="pl-10 pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {inputValue && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSearch}
                            className="h-6 w-6 p-0 hover:bg-transparent"
                        >
                            <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={() => handleSearch()}
                        size="sm"
                        className="h-8"
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestionsList && (
                <Card
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto"
                >
                    <CardContent className="p-0">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && !inputValue && (
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Recent Searches
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearRecentSearches}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-secondary/80"
                                            onClick={() => handleSuggestionClick(term)}
                                        >
                                            {term}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {suggestions && (
                            <div className="p-2">
                                {suggestions.titles?.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                                            Books
                                        </div>
                                        {suggestions.titles.map((title, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(title)}
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm"
                                            >
                                                {title}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {suggestions.authors?.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                                            Authors
                                        </div>
                                        {suggestions.authors.map((author, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(author)}
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm"
                                            >
                                                {author}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {suggestions.tags?.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                                            Tags
                                        </div>
                                        {suggestions.tags.map((tag, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(tag)}
                                                className="w-full text-left px-2 py-1 text-sm hover:bg-accent rounded-sm"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(!suggestions.titles?.length && !suggestions.authors?.length && !suggestions.tags?.length) && (
                                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                                        No suggestions found
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}