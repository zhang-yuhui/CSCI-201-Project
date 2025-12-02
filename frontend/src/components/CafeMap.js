import React, { useState, useEffect, useCallback } from "react";
import { Filter, X, Search } from "lucide-react";
import MapWithMarker from './MapWithMarker';

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 140px)",
  backgroundColor: "#dedede",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  color: "#444",
};

const CafeMap = () => {
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    wifi: false,
    bathrooms: false,
    outlets: false,
    metro: false,
    priceRange: 2, 
    minRating: 3.5,
    maxDistance: 4,
  });

  // Temporary filters that user is editing
  const [tempFilters, setTempFilters] = useState(filters);

  const [cafes, setCafes] = useState([]);

  // Simulated café data
  const fetchCafes = useCallback(() => {
    const fakeData = [
      {
        id: 1,
        name: "Bluebird Cafe",
        rating: 4.5,
        price: 2,
        wifi: true,
        bathrooms: true,
        outlets: false,
        metro: true,
      },
      {
        id: 2,
        name: "Java House",
        rating: 4.0,
        price: 1,
        wifi: true,
        bathrooms: false,
        outlets: true,
        metro: false,
      },
      {
        id: 3,
        name: "Downtown Coffee",
        rating: 3.8,
        price: 3,
        wifi: true,
        bathrooms: true,
        outlets: true,
        metro: true,
      },
    ];

    const filtered = fakeData.filter((cafe) => {
      if (activeSearchText && !cafe.name.toLowerCase().includes(activeSearchText.toLowerCase()))
        return false;

      if (filters.wifi && !cafe.wifi) return false;
      if (filters.bathrooms && !cafe.bathrooms) return false;
      if (filters.outlets && !cafe.outlets) return false;
      if (filters.metro && !cafe.metro) return false;
      if (filters.priceRange < cafe.price) return false;
      if (filters.minRating > cafe.rating) return false;

      return true;
    });

    setCafes(filtered);
  }, [filters, activeSearchText]);

  useEffect(() => {
    fetchCafes();
  }, [fetchCafes]);

  // Apply filters handler
  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  // Handle search button click
  const handleSearch = () => {
    setActiveSearchText(searchText);
  };

  // Reset temp filters when opening panel
  useEffect(() => {
    if (showFilters) {
      setTempFilters(filters);
    }
  }, [showFilters, filters]);

  return (
    <div style={{ margin: 0, padding: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ 
        padding: "1rem 1.5rem", 
        backgroundColor: "#6B4E3D",
        color: "white"
      }}>
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "500" }}>Cafe Map</h1>
      </div>
      
      {/* Search Bar & Filter Button */}
      <div style={{ 
        padding: "1rem 1.5rem", 
        display: "flex", 
        gap: "0.75rem", 
        alignItems: "center",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <input
          type="text"
          placeholder="Search cafes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            padding: "0.75rem 1rem",
            flex: "0 0 25%",
            border: "1px solid #d0c4b8",
            borderRadius: "8px",
            fontSize: "1rem",
            outline: "none",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "0.75rem",
            background: "#6B4E3D",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
          }}
        >
          <Search size={20} />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: "0.75rem",
            background: "#6B4E3D",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
          }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Map with Filter Overlay */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              width: "360px",
              maxWidth: "calc(100% - 2rem)",
              padding: "0",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              zIndex: 10,
              overflow: "hidden",
              color: "#6F4E37"
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "1rem 1.25rem",
              borderBottom: "1px solid #f0f0f0"
            }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.25rem" }}>
              {/* Amenities Section */}
              <div style={{ marginBottom: "1.5rem" }}>
                <strong style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.95rem" }}>Amenities</strong>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {[
                    { key: "wifi", label: "WiFi" },
                    { key: "bathrooms", label: "Bathrooms" },
                    { key: "outlets", label: "Outlets" },
                    { key: "metro", label: "Metro-Friendly" }
                  ].map(({ key, label }) => (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "6px",
                        border: tempFilters[key] ? "1.5px solid #2d2d2d" : "1.5px solid #e0e0e0",
                        background: tempFilters[key] ? "#f5f5f5" : "white",
                        fontSize: "0.9rem",
                        transition: "all 0.2s",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={tempFilters[key]}
                        onChange={() => setTempFilters({ ...tempFilters, [key]: !tempFilters[key] })}
                        style={{
                          marginRight: "0.5rem",
                          width: "16px",
                          height: "16px",
                          accentColor: "#2d2d2d",
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>Price Range: {"$".repeat(tempFilters.priceRange)}</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={tempFilters.priceRange}
                  onChange={(e) => setTempFilters({ ...tempFilters, priceRange: Number(e.target.value) })}
                  style={{ 
                    width: "100%", 
                    accentColor: "#2d2d2d",
                    height: "6px",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#6F4E37", marginTop: "0.35rem" }}>
                  <span>$</span>
                  <span>$$</span>
                  <span>$$$</span>
                </div>
              </div>

              {/* Minimum Rating */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>Minimum Rating: {tempFilters.minRating} stars</strong>
                  <span style={{ fontSize: "0.85rem", color: "#888" }}>
                    {"⭐".repeat(Math.floor(tempFilters.minRating))}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={tempFilters.minRating}
                  onChange={(e) => setTempFilters({ ...tempFilters, minRating: Number(e.target.value) })}
                  style={{ 
                    width: "100%", 
                    accentColor: "#2d2d2d",
                    height: "6px",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#888", marginTop: "0.35rem" }}>
                  <span>Any</span>
                  <span>⭐⭐⭐⭐⭐</span>
                </div>
              </div>

              {/* Distance */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>Distance: Within {tempFilters.maxDistance} miles</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={tempFilters.maxDistance}
                  onChange={(e) => setTempFilters({ ...tempFilters, maxDistance: Number(e.target.value) })}
                  style={{ 
                    width: "100%", 
                    accentColor: "#2d2d2d",
                    height: "6px",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#888", marginTop: "0.35rem" }}>
                  <span>1 mi</span>
                  <span>10 mi</span>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyFilters}
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  background: "#6B4E3D",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.background = "#5a3f31"}
                onMouseLeave={(e) => e.target.style.background = "#6B4E3D"}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
        <div style={mapContainerStyle}>
          <MapWithMarker />
        </div>
      </div>
    </div>
  );
};

export default CafeMap;