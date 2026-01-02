import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {
    // Task 1: Define state variables for the search query, age range, and search results.
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [ageRange, setAgeRange] = useState(10);
    const [searchResults, setSearchResults] = useState([]);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    const navigate = useNavigate();

    useEffect(() => {
        // fetch all products on initial load
        const fetchProducts = async () => {
            try {
                let url = `${urlConfig.backendUrl}/api/gifts`;
                console.log(url);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    // Task 2: Fetch search results from the API based on user inputs.
    const handleSearch = async () => {
        try {
            let url = `${urlConfig.backendUrl}/api/search?`;
            const params = new URLSearchParams();

            if (searchQuery) {
                params.append('name', searchQuery);
            }
            if (selectedCategory) {
                params.append('category', selectedCategory);
            }
            if (selectedCondition) {
                params.append('condition', selectedCondition);
            }
            if (ageRange) {
                params.append('age_years', ageRange);
            }

            url += params.toString();
            console.log('Search URL:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error; ${response.status}`);
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.log('Search error: ' + error.message);
        }
    };

    // Task 6: Enable navigation to the details page of a selected gift.
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>
                        <div className="d-flex flex-column">
                            {/* Task 3: Dynamically generate category and condition dropdown options */}
                            <div className="mb-3">
                                <label htmlFor="category" className="form-label">Category</label>
                                <select
                                    id="category"
                                    className="form-select dropdown-filter"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="condition" className="form-label">Condition</label>
                                <select
                                    id="condition"
                                    className="form-select dropdown-filter"
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    {conditions.map((condition, index) => (
                                        <option key={index} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Task 4: Implement an age range slider and display the selected value */}
                            <div className="mb-3">
                                <label htmlFor="ageRange" className="form-label">
                                    Age (Years): Less than {ageRange} years
                                </label>
                                <input
                                    type="range"
                                    className="form-range age-range-slider"
                                    id="ageRange"
                                    min="1"
                                    max="10"
                                    value={ageRange}
                                    onChange={(e) => setAgeRange(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Task 7: Add text input field for search criteria */}
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search for gifts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Task 8: Implement search button with onClick event to trigger search */}
                    <button className="btn btn-primary search-button mb-4" onClick={handleSearch}>
                        Search
                    </button>

                    {/* Task 5: Display search results and handle empty results with a message */}
                    <div className="search-results">
                        {searchResults.length === 0 ? (
                            <div className="alert alert-info no-results-message">
                                No products found. Try adjusting your search criteria.
                            </div>
                        ) : (
                            searchResults.map((gift) => (
                                <div
                                    key={gift.id}
                                    className="card search-results-card mb-3"
                                    onClick={() => goToDetailsPage(gift.id)}
                                >
                                    <div className="row g-0">
                                        <div className="col-md-4">
                                            {gift.image ? (
                                                <img
                                                    src={gift.image}
                                                    alt={gift.name}
                                                    className="img-fluid rounded-start search-result-image"
                                                />
                                            ) : (
                                                <div className="no-image-placeholder">No Image</div>
                                            )}
                                        </div>
                                        <div className="col-md-8">
                                            <div className="card-body">
                                                <h5 className="card-title">{gift.name}</h5>
                                                <p className="card-text">
                                                    <small className="text-muted">
                                                        Category: {gift.category} | Condition: {gift.condition}
                                                    </small>
                                                </p>
                                                <p className="card-text">{gift.description?.substring(0, 100)}...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;
