import React from 'react';
import '../styles/LoadingSpinner.css';  // Asegúrate de que la ruta sea correcta

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
        <div className="spinner">
            CODE<span className="txtspanspinner">MX</span>
        </div>
    </div>
  );
};

export default LoadingSpinner;
