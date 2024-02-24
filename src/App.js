import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [planets, setPlanets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  useEffect(() => {
    fetchPlanets();
  }, [currentPage]);

  const fetchPlanets = async () => {
    try {
      const response = await axios.get(`https://swapi.dev/api/planets/?format=json&page=${currentPage}`);
      const fetchedPlanets = [];
  
      for (const planet of response.data.results) {
        const residents = await Promise.all(
          planet.residents.map(async (residentUrl) => {
            const residentResponse = await axios.get(residentUrl);
            return residentResponse.data;
          })
        );
        fetchedPlanets.push({ ...planet, residents });
      }
  
      setPlanets(fetchedPlanets);
      const totalCount = Math.ceil(response.data.count / 10);
      setTotalPages(totalCount);
    } catch (error) {
      console.error('Error fetching planets:', error);
    }
  };
  
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const toggleResidents = (planet) => {
    setSelectedPlanet(selectedPlanet === planet ? null : planet);
  };

  const renderResidents = (residents) => {
    if (residents.length === 0) return null;
    return (
      <div className="residents-container">
        {residents.map((resident, index) => (
          <div key={index} className="resident-card">
            <p><strong>Name:</strong> {resident.name}</p>
            <p><strong>Height:</strong> {resident.height}</p>
            <p><strong>Mass:</strong> {resident.mass}</p>
            <p><strong>Gender:</strong> {resident.gender}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderPlanets = () => {
    return planets.map((planet, index) => (
      <div key={index} className="planet-container">
        <div className="planet-card">
          <h2>{planet.name}</h2>
          <p className="planet-info">Climate: {planet.climate}</p>
          <p className="planet-info">Population: {planet.population}</p>
          <p className="planet-info">Terrain: {planet.terrain}</p>
          {planet.residents.length > 0 && (
            <button onClick={() => toggleResidents(planet)}>Show Residents</button>
          )}
        </div>
        {selectedPlanet === planet && (
          <div className="residents-container">
            {renderResidents(planet.residents)}
          </div>
        )}
      </div>
    ));
  };
  
  const renderPagination = () => {
    const prevPage = currentPage - 1 > 0 ? currentPage - 1 : null;
    const nextPage = currentPage + 1 <= totalPages ? currentPage + 1 : null;
    const paginationItems = [];
    
    if (prevPage) {
      paginationItems.push(
        <button key="prev" onClick={() => handlePageClick(prevPage)}>{"<<"}</button>
      );
    }
    
    let startPage = currentPage - 2 > 0 ? currentPage - 2 : 1;
    let endPage = startPage + 4 < totalPages ? startPage + 4 : totalPages;
    
    if (endPage - startPage < 4) {
      startPage = endPage - 4 > 0 ? endPage - 4 : 1;
    }
    
    for (let i = startPage; i <= endPage; i++) {
      if (i === currentPage) {
        paginationItems.push(
          <button key={i} className="active" onClick={() => handlePageClick(i)}>{i}</button>
        );
      } else {
        paginationItems.push(
          <button key={i} onClick={() => handlePageClick(i)}>{i}</button>
        );
      }
    }
    
    if (nextPage) {
      paginationItems.push(
        <button key="next" onClick={() => handlePageClick(nextPage)}>{">>"}</button>
      );
    } 
    return paginationItems;
  };
  
  return (
    <div className="App">
      <h1>Star Wars Planets Directory</h1>
      {planets.length > 0 ? (
        <div>
          <div className="planets-list">
            {renderPlanets()}
          </div>
          <div className="pagination">
            {renderPagination()}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
